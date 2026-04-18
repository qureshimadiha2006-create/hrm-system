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

// ✅ Test DB Connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Error:", err));

/* 🔥 AUTO CREATE TABLES */
const createTables = async () => {
  try {
    // Departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id SERIAL PRIMARY KEY,
        dept_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // ✅ NEW: Roles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    console.log("✅ Tables ready");
  } catch (err) {
    console.error("❌ Table creation error:", err);
  }
};

createTables();

/* ================= DEPARTMENT APIs ================= */

// Get Active Departments
app.get("/departments", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM departments WHERE is_deleted = FALSE"
  );
  res.json(result.rows);
});

// Get Deleted Departments
app.get("/deleted-departments", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM departments WHERE is_deleted = TRUE"
  );
  res.json(result.rows);
});

// Add Department
app.post("/add-department", async (req, res) => {
  const { dept_name, description } = req.body;

  await pool.query(
    "INSERT INTO departments (dept_name, description) VALUES ($1, $2)",
    [dept_name, description]
  );

  res.send("Department Added");
});

// Update Department
app.put("/update-department/:id", async (req, res) => {
  const { dept_name, description } = req.body;
  const id = req.params.id;

  await pool.query(
    "UPDATE departments SET dept_name=$1, description=$2 WHERE dept_id=$3",
    [dept_name, description, id]
  );

  res.send("Department Updated");
});

// Delete Department
app.delete("/delete-department/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    "UPDATE departments SET is_deleted = TRUE WHERE dept_id=$1",
    [id]
  );

  res.send("Department Deleted");
});

// Restore Department
app.put("/restore-department/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    "UPDATE departments SET is_deleted = FALSE WHERE dept_id=$1",
    [id]
  );

  res.send("Department Restored");
});

/* ================= ROLE APIs (NEW MODULE) ================= */

// Get Active Roles
app.get("/roles", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM roles WHERE is_deleted = FALSE"
  );
  res.json(result.rows);
});

// Get Deleted Roles
app.get("/deleted-roles", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM roles WHERE is_deleted = TRUE"
  );
  res.json(result.rows);
});

// Add Role
app.post("/add-role", async (req, res) => {
  const { role_name, description } = req.body;

  await pool.query(
    "INSERT INTO roles (role_name, description) VALUES ($1, $2)",
    [role_name, description]
  );

  res.send("Role Added");
});

// Update Role
app.put("/update-role/:id", async (req, res) => {
  const { role_name, description } = req.body;
  const id = req.params.id;

  await pool.query(
    "UPDATE roles SET role_name=$1, description=$2 WHERE role_id=$3",
    [role_name, description, id]
  );

  res.send("Role Updated");
});

// Delete Role
app.delete("/delete-role/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    "UPDATE roles SET is_deleted = TRUE WHERE role_id=$1",
    [id]
  );

  res.send("Role Deleted");
});

// Restore Role
app.put("/restore-role/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    "UPDATE roles SET is_deleted = FALSE WHERE role_id=$1",
    [id]
  );

  res.send("Role Restored");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});