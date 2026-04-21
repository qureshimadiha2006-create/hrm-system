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

/* ================= 1. DEPARTMENTS (Fixed Delete/Restore) ================= */

app.get("/departments", async (req, res) => {
  const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE ORDER BY dept_id ASC");
  res.json(result.rows);
});

app.get("/deleted-departments", async (req, res) => {
  const result = await pool.query("SELECT * FROM departments WHERE is_deleted = TRUE ORDER BY dept_id ASC");
  res.json(result.rows);
});

app.post("/add-department", async (req, res) => {
  const { dept_name, description } = req.body;
  await pool.query("INSERT INTO departments (dept_name, description) VALUES ($1, $2)", [dept_name, description]);
  res.status(201).send("Department Added");
});

app.put("/delete-department/:id", async (req, res) => {
  await pool.query("UPDATE departments SET is_deleted = TRUE WHERE dept_id = $1", [req.params.id]);
  res.send("Department moved to trash");
});

app.put("/restore-department/:id", async (req, res) => {
  await pool.query("UPDATE departments SET is_deleted = FALSE WHERE dept_id = $1", [req.params.id]);
  res.send("Department restored");
});

/* ================= 2. ROLES (Fixed Delete/Restore) ================= */

app.get("/roles", async (req, res) => {
  const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE ORDER BY role_id ASC");
  res.json(result.rows);
});

app.get("/deleted-roles", async (req, res) => {
  const result = await pool.query("SELECT * FROM roles WHERE is_deleted = TRUE ORDER BY role_id ASC");
  res.json(result.rows);
});

app.post("/add-role", async (req, res) => {
  const { role_name, description } = req.body;
  await pool.query("INSERT INTO roles (role_name, description) VALUES ($1, $2)", [role_name, description]);
  res.status(201).send("Role Added");
});

app.put("/delete-role/:id", async (req, res) => {
  await pool.query("UPDATE roles SET is_deleted = TRUE WHERE role_id = $1", [req.params.id]);
  res.send("Role moved to trash");
});

app.put("/restore-role/:id", async (req, res) => {
  await pool.query("UPDATE roles SET is_deleted = FALSE WHERE role_id = $1", [req.params.id]);
  res.send("Role restored");
});

/* ================= 3. EMPLOYEES (Fixed Delete/Restore) ================= */

app.get("/employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees WHERE is_deleted = FALSE ORDER BY emp_id ASC");
  res.json(result.rows);
});

app.get("/deleted-employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees WHERE is_deleted = TRUE ORDER BY emp_id ASC");
  res.json(result.rows);
});

app.post("/add-employee", async (req, res) => {
  const { emp_name, email, phone, address, region, role_id, dept_id } = req.body;
  await pool.query(
    "INSERT INTO employees (emp_name, email, phone, address, region, role_id, dept_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [emp_name, email, phone, address, region, role_id, dept_id]
  );
  res.status(201).send("Employee Added");
});

app.put("/delete-employee/:id", async (req, res) => {
  await pool.query("UPDATE employees SET is_deleted = TRUE WHERE emp_id = $1", [req.params.id]);
  res.send("Employee moved to trash");
});

app.put("/restore-employee/:id", async (req, res) => {
  await pool.query("UPDATE employees SET is_deleted = FALSE WHERE emp_id = $1", [req.params.id]);
  res.send("Employee restored");
});

//* ================= LEAVE MANAGEMENT (ID ONLY) ================= */

// 1. Get Quota and History by ID
app.get("/leaves/:id", async (req, res) => {
  try {
    const emp_id = req.params.id; // Takes the ID from the URL (e.g., /leaves/1)
    const quota = await pool.query("SELECT * FROM leave_quota WHERE emp_id = $1", [emp_id]);
    const history = await pool.query("SELECT * FROM leaves WHERE emp_id = $1 ORDER BY applied_at DESC", [emp_id]);
    
    res.json({ 
      quota: quota.rows[0] || { sl_quota: 0, pl_quota: 0, cl_quota: 0 }, 
      history: history.rows 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 2. Apply for Leave by ID
app.post("/leaves/apply", async (req, res) => {
  try {
    const { emp_id, type, reason, from, to } = req.body;
    await pool.query(
      "INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date) VALUES ($1, $2, $3, $4, $5)",
      [emp_id, type, reason, from, to]
    );
    res.send("Leave applied successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});
/* ... your existing routes like /employees, /leaves etc ... */

// --- PASTE THE TEMPORARY ROUTE HERE ---
app.get("/setup-test-data", async (req, res) => {
  try {
    // 1. Give Employee ID 1 some quota
    await pool.query(`
      INSERT INTO leave_quota (emp_id, sl_quota, pl_quota, cl_quota, year) 
      VALUES (1, 5, 12, 8, 2026) 
      ON CONFLICT (emp_id) DO UPDATE SET sl_quota = 5, pl_quota = 12, cl_quota = 8;
    `);
    
    // 2. Add a sample leave history entry
    await pool.query(`
      INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date, status) 
      VALUES (1, 'PL', 'Reference Leave Entry', '2026-05-10', '2026-05-12', 'Approved');
    `);
    
    res.send("✅ Test data created for ID 1! You can now delete this route.");
  } catch (err) {
    res.status(500).send("Error creating data: " + err.message);
  }
});
/* ================= 5. SERVER START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));