const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* DATABASE CONNECTION */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hrm_system"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

/* TEST ROUTE */

app.get("/", (req, res) => {
  res.send("HRM Backend Server is Running");
});

/* ADD DEPARTMENT API */

app.post("/add-department", (req, res) => {

  const { dept_name, description } = req.body;

  const sql = `
    INSERT INTO department (dept_name, description, created_at, updated_at, status)
    VALUES (?, ?, NOW(), NOW(), TRUE)
  `;

  db.query(sql, [dept_name, description], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error inserting department");
    } else {
      res.send("Department added successfully");
    }
  });

});

/* GET DEPARTMENTS API */

app.get("/departments", (req, res) => {

  const sql = "SELECT * FROM department WHERE status = TRUE";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching departments");
    } else {
      res.json(result);
    }
  });

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.put("/update-department/:id", (req, res) => {
  const { dept_name, description } = req.body;
  const dept_id = req.params.id;

  const sql = `
    UPDATE department 
    SET dept_name = ?, description = ?, updated_at = NOW()
    WHERE dept_id = ?
  `;

  db.query(sql, [dept_name, description, dept_id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating department");
    } else {
      res.send("Department updated successfully");
    }
  });
});
app.delete("/delete-department/:id", (req, res) => {
  const id = req.params.id;

  const sql = "UPDATE department SET status = FALSE WHERE dept_id=?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleting department");
    } else {
      res.send("Department deleted successfully");
    }
  });
});