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

    // Roles table
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
  try {
    const result = await pool.query(
      "SELECT * FROM departments WHERE is_deleted = FALSE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching departments");
  }
});

// Get Deleted Departments
app.get("/deleted-departments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments WHERE is_deleted = TRUE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching deleted departments");
  }
});

// Add Department
app.post("/add-department", async (req, res) => {
  try {
    const { dept_name, description } = req.body;

    await pool.query(
      "INSERT INTO departments (dept_name, description) VALUES ($1, $2)",
      [dept_name, description]
    );

    res.send("Department Added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding department");
  }
});

// Update Department
app.put("/update-department/:id", async (req, res) => {
  try {
    const { dept_name, description } = req.body;
    const id = req.params.id;

    await pool.query(
      "UPDATE departments SET dept_name=$1, description=$2 WHERE dept_id=$3",
      [dept_name, description, id]
    );

    res.send("Department Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating department");
  }
});

// Delete Department
app.delete("/delete-department/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE departments SET is_deleted = TRUE WHERE dept_id=$1",
      [id]
    );

    res.send("Department Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting department");
  }
});

// Restore Department
app.put("/restore-department/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE departments SET is_deleted = FALSE WHERE dept_id=$1",
      [id]
    );

    res.send("Department Restored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error restoring department");
  }
});

/* ================= ROLE APIs ================= */

// Get Active Roles
app.get("/roles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roles WHERE is_deleted = FALSE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching roles");
  }
});

// Get Deleted Roles
app.get("/deleted-roles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roles WHERE is_deleted = TRUE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching deleted roles");
  }
});

// Add Role
app.post("/add-role", async (req, res) => {
  try {
    const { role_name, description } = req.body;

    await pool.query(
      "INSERT INTO roles (role_name, description) VALUES ($1, $2)",
      [role_name, description]
    );

    res.send("Role Added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding role");
  }
});

// Update Role
app.put("/update-role/:id", async (req, res) => {
  try {
    const { role_name, description } = req.body;
    const id = req.params.id;

    await pool.query(
      "UPDATE roles SET role_name=$1, description=$2 WHERE role_id=$3",
      [role_name, description, id]
    );

    res.send("Role Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating role");
  }
});

// Delete Role
app.delete("/delete-role/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE roles SET is_deleted = TRUE WHERE role_id=$1",
      [id]
    );

    res.send("Role Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting role");
  }
});

// Restore Role
app.put("/restore-role/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE roles SET is_deleted = FALSE WHERE role_id=$1",
      [id]
    );

    res.send("Role Restored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error restoring role");
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});