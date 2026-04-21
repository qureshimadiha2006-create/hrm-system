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
    await pool.query(`CREATE TABLE IF NOT EXISTS departments (dept_id SERIAL PRIMARY KEY, dept_name VARCHAR(100), description VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE)`);
    // 2. Roles Table
    await pool.query(`CREATE TABLE IF NOT EXISTS roles (role_id SERIAL PRIMARY KEY, role_name VARCHAR(100), description VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE)`);
    // 3. Employees Table
    await pool.query(`CREATE TABLE IF NOT EXISTS employees (emp_id SERIAL PRIMARY KEY, emp_name VARCHAR(100), email VARCHAR(100) UNIQUE, phone VARCHAR(20), address TEXT, region VARCHAR(50), role_id INT, dept_id INT, manager_id INT, otp VARCHAR(6), is_deleted BOOLEAN DEFAULT FALSE)`);
    // 4. Tasks Table
    await pool.query(`CREATE TABLE IF NOT EXISTS tasks (task_id SERIAL PRIMARY KEY, task_title VARCHAR(255) NOT NULL, task_description TEXT, priority VARCHAR(20), assigned_to INT REFERENCES employees(emp_id), start_date DATE, end_date DATE, task_type VARCHAR(20), status VARCHAR(20) DEFAULT 'Pending', is_deleted BOOLEAN DEFAULT FALSE)`);
    // 5. Performance Reviews Table
    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (review_id SERIAL PRIMARY KEY, review_title VARCHAR(255), emp_id INT REFERENCES employees(emp_id), review_date DATE, review_period VARCHAR(50), rating INT, comment TEXT, is_deleted BOOLEAN DEFAULT FALSE)`);
    
    // 6. Leave Quota Table
    await pool.query(`CREATE TABLE IF NOT EXISTS leave_quota (id SERIAL PRIMARY KEY, emp_id INT UNIQUE REFERENCES employees(emp_id) ON DELETE CASCADE, sl_quota DECIMAL(5,2) DEFAULT 0, pl_quota DECIMAL(5,2) DEFAULT 0, cl_quota DECIMAL(5,2) DEFAULT 0, year INT DEFAULT 2024)`);
    // 7. Leave Requests Table
    await pool.query(`CREATE TABLE IF NOT EXISTS leaves (leave_id SERIAL PRIMARY KEY, emp_id INT REFERENCES employees(emp_id) ON DELETE CASCADE, leave_type VARCHAR(10) CHECK (leave_type IN ('SL', 'PL', 'CL')), reason TEXT NOT NULL, from_date DATE NOT NULL, to_date DATE NOT NULL, status VARCHAR(20) DEFAULT 'Pending', applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    console.log("✅ All Tables Ready");
  } catch (err) {
    console.error("❌ Init DB Error:", err);
  }
};
initDB();

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("🚀 HRM Backend Running Successfully");
});
/* ================= LEAVE MANAGEMENT APIs ================= */

// 1. Get Quota and History by Email
app.get("/leaves", async (req, res) => {
  try {
    const { email } = req.query;
    const emp = await pool.query("SELECT emp_id FROM employees WHERE email = $1", [email]);
    if (emp.rows.length === 0) return res.status(404).send("Employee not found");
    const emp_id = emp.rows[0].emp_id;

    const quota = await pool.query("SELECT * FROM leave_quota WHERE emp_id = $1", [emp_id]);
    const history = await pool.query("SELECT * FROM leaves WHERE emp_id = $1 ORDER BY applied_at DESC", [emp_id]);
    res.json({ quota: quota.rows[0], history: history.rows });
  } catch (err) { res.status(500).json(err.message); }
});

// 2. Apply for Leave by Email
app.post("/leaves/apply", async (req, res) => {
  try {
    const { email, type, reason, from, to } = req.body;
    const emp = await pool.query("SELECT emp_id FROM employees WHERE email = $1", [email]);
    if (emp.rows.length === 0) return res.status(404).send("Employee not found");
    
    await pool.query(
      "INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date) VALUES ($1, $2, $3, $4, $5)",
      [emp.rows[0].emp_id, type, reason, from, to]
    );
    res.json({ message: "Leave applied successfully" });
  } catch (err) { res.status(500).json(err.message); }
});

/* ================= PERFORMANCE REVIEW APIs ================= */
app.post("/add-review", async (req, res) => { /* original code */ });
app.get("/reviews", async (req, res) => { /* original code */ });

/* ================= TASK MANAGEMENT APIs ================= */
app.post("/add-task", async (req, res) => { /* original code */ });
app.get("/tasks", async (req, res) => { /* original code */ });

/* ================= EMPLOYEES, ROLES, DEPT ================= */
app.get("/employees", async (req, res) => { /* original code */ });
app.get("/departments", async (req, res) => { /* original code */ });
app.get("/roles", async (req, res) => { /* original code */ });

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));