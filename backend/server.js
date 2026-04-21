require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/* ================= 1. DEPARTMENTS ================= */
app.get("/departments", async (req, res) => {
  const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE ORDER BY dept_id ASC");
  res.json(result.rows);
});

app.post("/add-department", async (req, res) => {
  const { dept_name, description } = req.body;
  await pool.query("INSERT INTO departments (dept_name, description) VALUES ($1, $2)", [dept_name, description]);
  res.status(201).send("Department Added");
});

/* ================= 2. ROLES ================= */
app.get("/roles", async (req, res) => {
  const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE ORDER BY role_id ASC");
  res.json(result.rows);
});

app.post("/add-role", async (req, res) => {
  const { role_name, description } = req.body;
  await pool.query("INSERT INTO roles (role_name, description) VALUES ($1, $2)", [role_name, description]);
  res.status(201).send("Role Added");
});

/* ================= 3. EMPLOYEES ================= */
app.get("/employees", async (req, res) => {
  const result = await pool.query("SELECT * FROM employees WHERE is_deleted = FALSE ORDER BY emp_id ASC");
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

/* ================= LEAVE MANAGEMENT ================= */
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

/* ================= PERFORMANCE MANAGEMENT ================= */
app.post("/add-review", async (req, res) => {
  try {
    const { emp_id, rating, review_comment, review_date, review_period, review_title } = req.body;
    // FIX: Added review_title to the INSERT statement to match your frontend payload
    await pool.query(
      "INSERT INTO reviews (emp_id, rating, review_comment, review_date, review_period, review_title) VALUES ($1, $2, $3, $4, $5, $6)",
      [emp_id, rating, review_comment, review_date, review_period, review_title]
    );
    res.status(201).send("✅ Review added successfully");
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});

/* ================= TASK MANAGEMENT ================= */
app.post("/add-task", async (req, res) => {
  try {
    const { task_title, task_description, priority, assigned_to, start_date, end_date, task_type } = req.body;
    // FIX: Column names must match the table created in /create-tables
    await pool.query(
      "INSERT INTO tasks (title, description, priority, assigned_to, start_date, end_date, type) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [task_title, task_description, priority, assigned_to, start_date, end_date, task_type]
    );
    res.status(201).send("✅ Task created successfully");
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});

/* ================= DATABASE SETUP ROUTES ================= */
app.get("/create-tables", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        emp_id INT REFERENCES employees(emp_id),
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
        assigned_to INT REFERENCES employees(emp_id),
        start_date DATE,
        end_date DATE,
        type VARCHAR(50)
      );
    `);
    res.send("<h1>✅ Tables Created Successfully!</h1>");
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/setup-test-data", async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO leave_quota (emp_id, sl_quota, pl_quota, cl_quota, year) 
      VALUES (1, 5, 12, 8, 2026) 
      ON CONFLICT (emp_id) DO UPDATE SET sl_quota = 5, pl_quota = 12, cl_quota = 8;
    `);
    res.send("✅ Test data created!");
  } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));