console.log("🔥 NEW CODE RUNNING");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ✅ Test DB
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Error:", err));

/* 🔥 CREATE TABLES */
const createTables = async () => {
  try {
    // Departments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id SERIAL PRIMARY KEY,
        dept_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Roles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Employees ✅ NEW
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        emp_id SERIAL PRIMARY KEY,
        emp_name VARCHAR(100),
        email VARCHAR(100),
        role_id INT,
        dept_id INT,
        manager_id INT,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    console.log("✅ All tables ready");
  } catch (err) {
    console.error("❌ Table error:", err);
  }
};

createTables();

/* ================= DEPARTMENT ================= */

app.get("/departments", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM departments WHERE is_deleted = FALSE"
  );
  res.json(result.rows);
});

app.post("/add-department", async (req, res) => {
  const { dept_name, description } = req.body;

  await pool.query(
    "INSERT INTO departments (dept_name, description) VALUES ($1,$2)",
    [dept_name, description]
  );

  res.send("Department Added");
});

app.put("/update-department/:id", async (req, res) => {
  const { dept_name, description } = req.body;

  await pool.query(
    "UPDATE departments SET dept_name=$1, description=$2 WHERE dept_id=$3",
    [dept_name, description, req.params.id]
  );

  res.send("Updated");
});

app.delete("/delete-department/:id", async (req, res) => {
  await pool.query(
    "UPDATE departments SET is_deleted=TRUE WHERE dept_id=$1",
    [req.params.id]
  );
  res.send("Deleted");
});

/* ================= ROLE ================= */

app.get("/roles", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM roles WHERE is_deleted = FALSE"
  );
  res.json(result.rows);
});

app.post("/add-role", async (req, res) => {
  const { role_name, description } = req.body;

  await pool.query(
    "INSERT INTO roles (role_name, description) VALUES ($1,$2)",
    [role_name, description]
  );

  res.send("Role Added");
});

app.put("/update-role/:id", async (req, res) => {
  const { role_name, description } = req.body;

  await pool.query(
    "UPDATE roles SET role_name=$1, description=$2 WHERE role_id=$3",
    [role_name, description, req.params.id]
  );

  res.send("Updated");
});

app.delete("/delete-role/:id", async (req, res) => {
  await pool.query(
    "UPDATE roles SET is_deleted=TRUE WHERE role_id=$1",
    [req.params.id]
  );
  res.send("Deleted");
});

/* ================= EMPLOYEE (NEW MODULE) ================= */

// ✅ GET Employees
app.get("/employees", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM employees WHERE is_deleted = FALSE"
  );
  res.json(result.rows);
});

// ✅ ADD Employee
app.post("/add-employee", async (req, res) => {
  const { emp_name, email, role_id, dept_id, manager_id } = req.body;

  await pool.query(
    "INSERT INTO employees (emp_name, email, role_id, dept_id, manager_id) VALUES ($1,$2,$3,$4,$5)",
    [emp_name, email, role_id, dept_id, manager_id]
  );

  res.send("Employee Added");
});

// ✅ UPDATE Employee
app.put("/update-employee/:id", async (req, res) => {
  const { emp_name, email, role_id, dept_id, manager_id } = req.body;

  await pool.query(
    "UPDATE employees SET emp_name=$1, email=$2, role_id=$3, dept_id=$4, manager_id=$5 WHERE emp_id=$6",
    [emp_name, email, role_id, dept_id, manager_id, req.params.id]
  );

  res.send("Employee Updated");
});

// ✅ DELETE Employee
app.delete("/delete-employee/:id", async (req, res) => {
  await pool.query(
    "UPDATE employees SET is_deleted=TRUE WHERE emp_id=$1",
    [req.params.id]
  );
  res.send("Employee Deleted");
});

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("HRM Backend Running 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});