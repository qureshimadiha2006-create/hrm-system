const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test DB Connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("DB Error:", err));

/* 🔥 AUTO CREATE TABLE */
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id SERIAL PRIMARY KEY,
        dept_name VARCHAR(100),
        description VARCHAR(255),
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log("Departments table ready");
  } catch (err) {
    console.error("Table creation error:", err);
  }
};

createTable();

/* ================= DEPARTMENT APIs ================= */

// Get Active Departments
app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments WHERE is_deleted = FALSE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
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
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
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
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
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
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Soft Delete
app.delete("/delete-department/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE departments SET is_deleted = TRUE WHERE dept_id=$1",
      [id]
    );

    res.send("Department Deleted");
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Restore
app.put("/restore-department/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      "UPDATE departments SET is_deleted = FALSE WHERE dept_id=$1",
      [id]
    );

    res.send("Department Restored");
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});