require("dotenv").config();
console.log("🔥 HRM SERVER STARTING...");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

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

/* ================= EMAIL SETUP ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= INIT TABLES ================= */

const initDB = async () => {
  try {
    // 1. Departments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id SERIAL PRIMARY KEY,
        dept_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // 2. Roles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // 3. Employees Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        emp_id SERIAL PRIMARY KEY,
        emp_name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        region VARCHAR(50),
        role_id INT,
        dept_id INT,
        manager_id INT,
        otp VARCHAR(6),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // 4. Tasks Table (New Module)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id SERIAL PRIMARY KEY,
        task_title VARCHAR(255) NOT NULL,
        task_description TEXT,
        priority VARCHAR(20), 
        assigned_to INT REFERENCES employees(emp_id),
        start_date DATE,
        end_date DATE,
        task_type VARCHAR(20), 
        status VARCHAR(20) DEFAULT 'Pending',
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // ✅ AUTOMATIC DATABASE FIX: Adds the OTP column if missing
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS otp VARCHAR(6)`);

    console.log("✅ All Tables Ready & Database Verified");
  } catch (err) {
    console.error("❌ Init DB Error:", err);
  }
};

initDB();

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("🚀 HRM Backend Running Successfully");
});

/* ================= FIX DB ================= */

app.get("/fix-db", async (req, res) => {
  try {
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS otp VARCHAR(6)`);
    // Ensure tasks table exists if manual fix is called
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id SERIAL PRIMARY KEY,
        task_title VARCHAR(255) NOT NULL,
        task_description TEXT,
        priority VARCHAR(20), 
        assigned_to INT REFERENCES employees(emp_id),
        start_date DATE,
        end_date DATE,
        task_type VARCHAR(20), 
        status VARCHAR(20) DEFAULT 'Pending',
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    res.send("✅ DB Migration & Task Table Check Completed");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

/* ================= OTP APIs ================= */

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("Email required");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await pool.query(
      "UPDATE employees SET otp = $1 WHERE email = $2 RETURNING *",
      [otp, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Email not found in Employee records");
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Password Reset",
      text: `Your OTP is ${otp}`,
    });

    res.send("OTP sent to email");
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).send("Error sending OTP");
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    const result = await pool.query(
      "SELECT * FROM employees WHERE email = $1 AND otp = $2",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid OTP");
    }

    await pool.query("UPDATE employees SET otp = NULL WHERE email = $1", [email]);
    res.send("Password reset successful");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= TASK MANAGEMENT APIs (New) ================= */

// 1. Create a Task
app.post("/add-task", async (req, res) => {
  try {
    const { task_title, task_description, priority, assigned_to, start_date, end_date, task_type } = req.body;
    await pool.query(
      `INSERT INTO tasks (task_title, task_description, priority, assigned_to, start_date, end_date, task_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [task_title, task_description, priority, assigned_to, start_date, end_date, task_type]
    );
    res.send("Task Created Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

// 2. Get All Tasks with Employee Name
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, e.emp_name 
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.emp_id
      WHERE t.is_deleted = FALSE
      ORDER BY t.task_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 3. Update Task Status (e.g., Mark Completed)
app.put("/update-task-status/:id", async (req, res) => {
  try {
    const { status } = req.body; 
    await pool.query(
      "UPDATE tasks SET status = $1 WHERE task_id = $2",
      [status, req.params.id]
    );
    res.send("Task Status Updated");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 4. Delete Task (Soft Delete)
app.delete("/delete-task/:id", async (req, res) => {
  try {
    await pool.query(
      "UPDATE tasks SET is_deleted = TRUE WHERE task_id = $1",
      [req.params.id]
    );
    res.send("Task Deleted Successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= DEPARTMENTS ================= */

app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/add-department", async (req, res) => {
  try {
    const { dept_name, description } = req.body;
    await pool.query("INSERT INTO departments (dept_name, description) VALUES ($1,$2)", [dept_name, description]);
    res.send("Department Added");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.delete("/delete-department/:id", async (req, res) => {
  try {
    await pool.query("UPDATE departments SET is_deleted = TRUE WHERE dept_id=$1", [req.params.id]);
    res.send("Department Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= ROLES ================= */

app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/add-role", async (req, res) => {
  try {
    const { role_name, description } = req.body;
    await pool.query("INSERT INTO roles (role_name, description) VALUES ($1,$2)", [role_name, description]);
    res.send("Role Added");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= EMPLOYEES ================= */

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, r.role_name, d.dept_name, m.emp_name AS manager_name
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.role_id
      LEFT JOIN departments d ON e.dept_id = d.dept_id
      LEFT JOIN employees m ON e.manager_id = m.emp_id
      WHERE e.is_deleted = FALSE
      ORDER BY e.emp_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/add-employee", async (req, res) => {
  try {
    const { emp_name, email, phone, address, region, role_id, dept_id, manager_id } = req.body;
    await pool.query(
      `INSERT INTO employees (emp_name, email, phone, address, region, role_id, dept_id, manager_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [emp_name, email, phone, address, region, role_id, dept_id, manager_id]
    );
    res.send("Employee Added");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.delete("/delete-employee/:id", async (req, res) => {
  try {
    await pool.query("UPDATE employees SET is_deleted = TRUE WHERE emp_id=$1", [req.params.id]);
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