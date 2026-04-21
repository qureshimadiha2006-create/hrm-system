require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 1. HEALTH CHECK
app.get("/", (req, res) => {
  res.send("<h1>🚀 HRM Backend is LIVE</h1><p>All modules (Leave, Task, Review, Employees) are ready.</p>");
});

/* ================= DATABASE CONNECTION ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/* ================= 1. DEPARTMENTS (Delete/Restore) ================= */
app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE ORDER BY dept_id ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/deleted-departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments WHERE is_deleted = TRUE ORDER BY dept_id ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/add-department", async (req, res) => {
  try {
    const { dept_name, description } = req.body;
    await pool.query("INSERT INTO departments (dept_name, description, is_deleted) VALUES ($1, $2, FALSE)", [dept_name, description]);
    res.status(201).send("Department Added");
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/delete-department/:id", async (req, res) => {
  try {
    await pool.query("UPDATE departments SET is_deleted = TRUE WHERE dept_id = $1", [req.params.id]);
    res.send("Deleted");
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/restore-department/:id", async (req, res) => {
  try {
    await pool.query("UPDATE departments SET is_deleted = FALSE WHERE dept_id = $1", [req.params.id]);
    res.send("Restored");
  } catch (err) { res.status(500).send(err.message); }
});

/* ================= 2. ROLES (Delete/Restore) ================= */
app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE ORDER BY role_id ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/deleted-roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles WHERE is_deleted = TRUE ORDER BY role_id ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/add-role", async (req, res) => {
  try {
    const { role_name, description } = req.body;
    await pool.query("INSERT INTO roles (role_name, description, is_deleted) VALUES ($1, $2, FALSE)", [role_name, description]);
    res.status(201).send("Role Added");
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/delete-role/:id", async (req, res) => {
  try {
    await pool.query("UPDATE roles SET is_deleted = TRUE WHERE role_id = $1", [req.params.id]);
    res.send("Deleted");
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/restore-role/:id", async (req, res) => {
  try {
    await pool.query("UPDATE roles SET is_deleted = FALSE WHERE role_id = $1", [req.params.id]);
    res.send("Restored");
  } catch (err) { res.status(500).send(err.message); }
});

/* ================= 3. EMPLOYEES ================= */
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees WHERE is_deleted = FALSE ORDER BY emp_id ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/add-employee", async (req, res) => {
  try {
    const { emp_name, email, phone, address, region, role_id, dept_id } = req.body;
    await pool.query(
      "INSERT INTO employees (emp_name, email, phone, address, region, role_id, dept_id, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)",
      [emp_name, email, phone, address, region, role_id, dept_id]
    );
    res.status(201).send("Employee Added");
  } catch (err) { res.status(500).send(err.message); }
});

/* ================= 4. LEAVE MANAGEMENT ================= */
app.get("/leaves/:id", async (req, res) => {
  try {
    const emp_id = req.params.id;
    const quota = await pool.query("SELECT * FROM leave_quota WHERE emp_id = $1", [emp_id]);
    const history = await pool.query("SELECT * FROM leaves WHERE emp_id = $1 ORDER BY applied_at DESC", [emp_id]);
    res.json({ 
      quota: quota.rows[0] || { sl_quota: 0, pl_quota: 0, cl_quota: 0 }, 
      history: history.rows 
    });
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/leaves/apply", async (req, res) => {
  try {
    const { emp_id, type, reason, from, to } = req.body;
    await pool.query(
      "INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date) VALUES ($1, $2, $3, $4, $5)",
      [emp_id, type, reason, from, to]
    );
    res.send("Leave applied successfully");
  } catch (err) { res.status(500).send(err.message); }
});

/* ================= 5. PERFORMANCE & TASKS ================= */
app.post("/add-review", async (req, res) => {
  try {
    const { emp_id, rating, review_comment, review_date, review_period, review_title } = req.body;
    await pool.query(
      "INSERT INTO reviews (emp_id, rating, review_comment, review_date, review_period, review_title) VALUES ($1, $2, $3, $4, $5, $6)",
      [emp_id, rating, review_comment, review_date, review_period, review_title]
    );
    res.status(201).send("✅ Review added");
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/add-task", async (req, res) => {
  try {
    const { task_title, task_description, priority, assigned_to, start_date, end_date, task_type } = req.body;
    await pool.query(
      "INSERT INTO tasks (title, description, priority, assigned_to, start_date, end_date, type) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [task_title, task_description, priority, assigned_to, start_date, end_date, task_type]
    );
    res.status(201).send("✅ Task created");
  } catch (err) { res.status(500).send(err.message); }
});

/* ================= 6. SYSTEM SETUP & TABLES ================= */
app.get("/create-tables", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        emp_id INT,
        review_title VARCHAR(255),
        rating INT,
        review_comment TEXT,
        review_date DATE,
        review_period VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS tasks (
        task_id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        priority VARCHAR(50),
        assigned_to INT,
        start_date DATE,
        end_date DATE,
        type VARCHAR(50)
      );
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
    `);
    res.send("<h1>✅ All Tables Synchronized!</h1>");
  } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));