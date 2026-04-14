const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;
app.listen(PORT, () => console.log("Server running"));

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

/* ================= DEPARTMENT ================= */

/* ADD */
app.post("/add-department", (req, res) => {
  const { dept_name, description } = req.body;

  const sql = `
    INSERT INTO department (dept_name, description, created_at, updated_at, status)
    VALUES (?, ?, NOW(), NOW(), TRUE)
  `;

  db.query(sql, [dept_name, description], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Department added");
  });
});

/* GET ACTIVE */
app.get("/departments", (req, res) => {
  db.query("SELECT * FROM department WHERE status=TRUE", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* GET DELETED */
app.get("/deleted-departments", (req, res) => {
  db.query("SELECT * FROM department WHERE status=FALSE", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* UPDATE */
app.put("/update-department/:id", (req, res) => {
  const { dept_name, description } = req.body;

  const sql = `
    UPDATE department 
    SET dept_name=?, description=?, updated_at=NOW()
    WHERE dept_id=?
  `;

  db.query(sql, [dept_name, description, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Updated");
  });
});

/* DELETE (SOFT) */
app.delete("/delete-department/:id", (req, res) => {
  db.query(
    "UPDATE department SET status=FALSE WHERE dept_id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Deleted");
    }
  );
});

/* RESTORE */
app.put("/restore-department/:id", (req, res) => {
  db.query(
    "UPDATE department SET status=TRUE WHERE dept_id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Restored");
    }
  );
});

/* ================= EMPLOYEE ================= */

/* ADD */
app.post("/add-employee", (req, res) => {
  const { emp_name, email, dept_id } = req.body;

  const sql = `
    INSERT INTO employee (emp_name, email, dept_id, created_at, updated_at, status)
    VALUES (?, ?, ?, NOW(), NOW(), TRUE)
  `;

  db.query(sql, [emp_name, email, dept_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Employee added");
  });
});

/* GET */
app.get("/employees", (req, res) => {
  const sql = `
    SELECT e.emp_id, e.emp_name, e.email, d.dept_name, e.dept_id
    FROM employee e
    JOIN department d ON e.dept_id = d.dept_id
    WHERE e.status=TRUE
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/* DELETE */
app.delete("/delete-employee/:id", (req, res) => {
  db.query(
    "UPDATE employee SET status=FALSE WHERE emp_id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Employee deleted");
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});