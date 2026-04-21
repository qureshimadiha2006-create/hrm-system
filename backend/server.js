require("dotenv").config();
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
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/* ================= 1. DEPARTMENTS ================= */
app.get("/departments", async (req, res) => {
  const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE");
  res.json(result.rows);
});

app.get("/deleted-departments", async (req, res) => {
  const result = await pool.query("SELECT * FROM departments WHERE is_deleted = TRUE");
  res.json(result.rows);
});

app.post("/add-department", async (req, res) => {
  const { dept_name, description } = req.body;
  await pool.query("INSERT INTO departments (dept_name, description) VALUES ($1, $2)", [dept_name, description]);
  res.send("Added");
});

app.put("/delete-department/:id", async (req, res) => {
  await pool.query("UPDATE departments SET is_deleted = TRUE WHERE dept_id = $1", [req.params.id]);
  res.send("Deleted");
});

app.put("/restore-department/:id", async (req, res) => {
  await pool.query("UPDATE departments SET is_deleted = FALSE WHERE dept_id = $1", [req.params.id]);
  res.send("Restored");
});

/* ================= 2. ROLES ================= */
app.get("/roles", async (req, res) => {
  const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE");
  res.json(result.rows);
});

app.get("/deleted-roles", async (req, res) => {
  const result = await pool.query("SELECT * FROM roles WHERE is_deleted = TRUE");
  res.json(result.rows);
});

app.post("/add-role", async (req, res) => {
  const { role_name, description } = req.body;
  await pool.query("INSERT INTO roles (role_name, description) VALUES ($1, $2)", [role_name, description]);
  res.send("Added");
});

app.put("/delete-role/:id", async (req, res) => {
  await pool.query("UPDATE roles SET is_deleted = TRUE WHERE role_id = $1", [req.params.id]);
  res.send("Deleted");
});

app.put("/restore-role/:id", async (req, res) => {
  await pool.query("UPDATE roles SET is_deleted = FALSE WHERE role_id = $1", [req.params.id]);
  res.send("Restored");
});

/* ================= 3. EMPLOYEES (With Delete/Restore) ================= */
app.get("/employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees WHERE is_deleted = FALSE");
  res.json(result.rows);
});

app.get("/deleted-employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees WHERE is_deleted = TRUE");
  res.json(result.rows);
});

app.post("/add-employee", async (req, res) => {
  const { emp_name, email, phone, address, region, role_id, dept_id } = req.body;
  await pool.query("INSERT INTO employees (emp_name, email, phone, address, region, role_id, dept_id) VALUES ($1, $2, $3, $4, $5, $6, $7)", [emp_name, email, phone, address, region, role_id, dept_id]);
  res.send("Employee Added");
});

app.put("/delete-employee/:id", async (req, res) => {
  await pool.query("UPDATE employees SET is_deleted = TRUE WHERE emp_id = $1", [req.params.id]);
  res.send("Employee Deleted");
});

app.put("/restore-employee/:id", async (req, res) => {
  await pool.query("UPDATE employees SET is_deleted = FALSE WHERE emp_id = $1", [req.params.id]);
  res.send("Employee Restored");
});

/* ================= 4. LEAVE MANAGEMENT (Email Sync) ================= */
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

app.post("/leaves/apply", async (req, res) => {
  try {
    const { email, type, reason, from, to } = req.body;
    const emp = await pool.query("SELECT emp_id FROM employees WHERE email = $1", [email]);
    if (emp.rows.length === 0) return res.status(404).send("Employee not found");
    await pool.query("INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date) VALUES ($1, $2, $3, $4, $5)", [emp.rows[0].emp_id, type, reason, from, to]);
    res.json({ message: "Success" });
  } catch (err) { res.status(500).json(err.message); }
});

/* ================= 5. TASKS & OTP ================= */
app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT t.*, e.emp_name FROM tasks t LEFT JOIN employees e ON t.assigned_to = e.emp_id WHERE t.is_deleted = FALSE");
  res.json(result.rows);
});

app.post("/add-task", async (req, res) => {
  const { task_title, task_description, priority, assigned_to, start_date, end_date, task_type } = req.body;
  await pool.query("INSERT INTO tasks (task_title, task_description, priority, assigned_to, start_date, end_date, task_type) VALUES ($1, $2, $3, $4, $5, $6, $7)", [task_title, task_description, priority, assigned_to, start_date, end_date, task_type]);
  res.send("Task Added");
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await pool.query("UPDATE employees SET otp = $1 WHERE email = $2", [otp, email]);
  await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: "OTP", text: `Your OTP is ${otp}` });
  res.send("OTP Sent");
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));