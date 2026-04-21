require("dotenv").config();
console.log("🔥 HRM SERVER STARTING...");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

const app = express();

// UPDATED CORS: Specifically allows your Vercel domain to talk to this server
app.use(cors({
  origin: ["https://hrm-system-eight.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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

    // 4. Tasks Table
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

    // 5. Performance Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        review_title VARCHAR(255),
        emp_id INT REFERENCES employees(emp_id),
        review_date DATE,
        review_period VARCHAR(50),
        rating INT,
        comment TEXT,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // 6. Leave Quota Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leave_quota (
        id SERIAL PRIMARY KEY,
        emp_id INT UNIQUE REFERENCES employees(emp_id) ON DELETE CASCADE,
        sl_quota DECIMAL(5,2) DEFAULT 0,
        pl_quota DECIMAL(5,2) DEFAULT 0,
        cl_quota DECIMAL(5,2) DEFAULT 0,
        year INT DEFAULT 2024
      );
    `);

    // 7. Leave Requests Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        leave_id SERIAL PRIMARY KEY,
        emp_id INT REFERENCES employees(emp_id) ON DELETE CASCADE,
        leave_type VARCHAR(10) CHECK (leave_type IN ('SL', 'PL', 'CL')),
        reason TEXT NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS otp VARCHAR(6)`);

    console.log("✅ All Tables Ready (Including Leave Management)");
  } catch (err) {
    console.error("❌ Init DB Error:", err);
  }
};

initDB();

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("🚀 HRM Backend Running Successfully");
});

/* ================= UPDATED LEAVE MANAGEMENT APIs (Email Sync) ================= */

// 1. Get balance and history using EMAIL instead of ID
app.get("/leaves", async (req, res) => {
  try {
    const { email } = req.query;
    // Step 1: Find the internal ID using the email
    const empResult = await pool.query("SELECT emp_id FROM employees WHERE email = $1", [email]);
    
    if (empResult.rows.length === 0) return res.status(404).send("Employee not found");
    const emp_id = empResult.rows[0].emp_id;

    // Step 2: Get quota and history using that ID
    const quota = await pool.query("SELECT * FROM leave_quota WHERE emp_id = $1", [emp_id]);
    const history = await pool.query("SELECT * FROM leaves WHERE emp_id = $1 ORDER BY applied_at DESC", [emp_id]);
    
    res.json({ quota: quota.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 2. Apply for leave using EMAIL
app.post("/leaves/apply", async (req, res) => {
  try {
    const { email, type, reason, from, to } = req.body;
    
    // Step 1: Find ID from email
    const empResult = await pool.query("SELECT emp_id FROM employees WHERE email = $1", [email]);
    if (empResult.rows.length === 0) return res.status(404).send("Employee not found");
    const emp_id = empResult.rows[0].emp_id;

    // Step 2: Insert leave request
    await pool.query(
      "INSERT INTO leaves (emp_id, leave_type, reason, from_date, to_date) VALUES ($1, $2, $3, $4, $5)",
      [emp_id, type, reason, from, to]
    );
    res.json({ message: "Leave applied successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});
/* ================= PERFORMANCE REVIEW APIs ================= */

app.post("/add-review", async (req, res) => {
  try {
    const { review_title, emp_id, review_date, review_period, rating, comment } = req.body;
    await pool.query(
      `INSERT INTO reviews (review_title, emp_id, review_date, review_period, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [review_title, emp_id, review_date, review_period, rating, comment]
    );
    res.send("Review Added Successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, e.emp_name 
      FROM reviews r
      JOIN employees e ON r.emp_id = e.emp_id
      WHERE r.is_deleted = FALSE
      ORDER BY r.review_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= TASK MANAGEMENT APIs ================= */

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
    res.status(500).json(err.message);
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, e.emp_name, r.review_period, r.rating
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.emp_id
      LEFT JOIN reviews r ON e.emp_id = r.emp_id
      WHERE t.is_deleted = FALSE
      ORDER BY t.task_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.delete("/delete-task/:id", async (req, res) => {
  try {
    await pool.query("UPDATE tasks SET is_deleted = TRUE WHERE task_id = $1", [req.params.id]);
    res.send("Task Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= EMPLOYEES, ROLES, DEPT ================= */

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees WHERE is_deleted = FALSE");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments WHERE is_deleted = FALSE");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles WHERE is_deleted = FALSE");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= OTP APIs ================= */

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await pool.query("UPDATE employees SET otp = $1 WHERE email = $2 RETURNING *", [otp, email]);
    if (result.rows.length === 0) return res.status(404).send("Email not found");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Password Reset",
      text: `Your OTP is ${otp}`,
    });
    res.send("OTP sent");
  } catch (err) {
    res.status(500).send("Error");
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});