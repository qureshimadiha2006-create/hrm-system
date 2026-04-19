require("dotenv").config();
console.log("🔥 HRM SERVER STARTING...");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB Error:", err));

/* ================= INIT TABLES ================= */

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id SERIAL PRIMARY KEY,
        dept_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        emp_id SERIAL PRIMARY KEY,
        emp_name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        region VARCHAR(50),
        role_id INT,
        dept_id INT,
        manager_id INT,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    console.log("✅ Tables Ready");
  } catch (err) {
    console.error("❌ Init DB Error:", err);
  }
};

initDB();

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("🚀 HRM Backend Running Successfully");
});

/* ================= FIX DB (RUN ONCE) ================= */

app.get("/fix-db", async (req, res) => {
  try {
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS region VARCHAR(50)`);

    res.send("✅ DB Migration Completed");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

/* ================= DEPARTMENTS ================= */

app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments WHERE is_deleted = FALSE"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/deleted-departments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments WHERE is_deleted = TRUE"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/add-department", async (req, res) => {
  try {
    const { dept_name, description } = req.body;

    await pool.query(
      "INSERT INTO departments (dept_name, description) VALUES ($1,$2)",
      [dept_name, description]
    );

    res.send("Department Added");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.delete("/delete-department/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE departments SET is_deleted = TRUE WHERE dept_id=$1",
      [req.params.id]
    );

    res.send("Department Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= ROLES ================= */

app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roles WHERE is_deleted = FALSE"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/add-role", async (req, res) => {
  try {
    const { role_name, description } = req.body;

    await pool.query(
      "INSERT INTO roles (role_name, description) VALUES ($1,$2)",
      [role_name, description]
    );

    res.send("Role Added");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= EMPLOYEES ================= */

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.emp_id,
        e.emp_name,
        e.email,
        e.phone,
        e.address,
        e.region,
        e.role_id,
        e.dept_id,
        e.manager_id,
        r.role_name,
        d.dept_name,
        m.emp_name AS manager_name
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.role_id
      LEFT JOIN departments d ON e.dept_id = d.dept_id
      LEFT JOIN employees m ON e.manager_id = m.emp_id
      WHERE e.is_deleted = FALSE
      ORDER BY e.emp_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

app.post("/add-employee", async (req, res) => {
  try {
    const {
      emp_name,
      email,
      phone,
      address,
      region,
      role_id,
      dept_id,
      manager_id
    } = req.body;

    await pool.query(
      `INSERT INTO employees 
      (emp_name, email, phone, address, region, role_id, dept_id, manager_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        emp_name,
        email,
        phone || null,
        address || null,
        region || null,
        role_id || null,
        dept_id || null,
        manager_id || null
      ]
    );

    res.send("Employee Added");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

app.put("/update-employee/:id", async (req, res) => {
  try {
    const {
      emp_name,
      email,
      phone,
      address,
      region,
      role_id,
      dept_id,
      manager_id
    } = req.body;

    await pool.query(
      `UPDATE employees 
       SET emp_name=$1,
           email=$2,
           phone=$3,
           address=$4,
           region=$5,
           role_id=$6,
           dept_id=$7,
           manager_id=$8
       WHERE emp_id=$9`,
      [
        emp_name,
        email,
        phone,
        address,
        region,
        role_id,
        dept_id,
        manager_id || null,
        req.params.id
      ]
    );

    res.send("Employee Updated");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

app.delete("/delete-employee/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE employees SET is_deleted = TRUE WHERE emp_id=$1",
      [req.params.id]
    );

    res.send("Employee Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});