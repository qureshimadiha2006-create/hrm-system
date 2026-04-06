import React, { useState } from "react";

function Employee() {
  const [employees, setEmployees] = useState([
    { emp_id: 1, emp_name: "John", email: "john@test.com", dept: "IT" },
    { emp_id: 2, emp_name: "Sara", email: "sara@test.com", dept: "HR" }
  ]);

  const [emp_name, setEmpName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [editId, setEditId] = useState(null);

  const handleSubmit = () => {
    // VALIDATION
    if (!emp_name || !email || !dept) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      const updated = employees.map((emp) =>
        emp.emp_id === editId
          ? { ...emp, emp_name, email, dept }
          : emp
      );
      setEmployees(updated);
      setEditId(null);
    } else {
      const newEmp = {
        emp_id: Date.now(),
        emp_name,
        email,
        dept
      };
      setEmployees([...employees, newEmp]);
    }

    setEmpName("");
    setEmail("");
    setDept("");
  };

  const deleteEmployee = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
  
    if (confirmDelete) {
      setEmployees(employees.filter((emp) => emp.emp_id !== id));
    }
  };

  const editEmployee = (emp) => {
    setEmpName(emp.emp_name);
    setEmail(emp.email);
    setDept(emp.dept);
    setEditId(emp.emp_id);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{editId ? "Edit Employee" : "Add Employee"}</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Employee Name"
          value={emp_name}
          onChange={(e) => setEmpName(e.target.value)}
          style={{ margin: "5px", padding: "5px" }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ margin: "5px", padding: "5px" }}
        />

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          style={{ margin: "5px", padding: "5px" }}
        >
          <option value="">Select Department</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>
      </div>

      <button style={{ padding: "6px 15px" }} onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <h2 style={{ marginTop: "30px" }}>Employee List</h2>

      <table
        border="1"
        style={{ margin: "auto", borderCollapse: "collapse", width: "70%" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.emp_id}>
              <td>{emp.emp_name}</td>
              <td>{emp.email}</td>
              <td>{emp.dept}</td>
              <td>
                <button onClick={() => editEmployee(emp)}>Edit</button>
                <button onClick={() => deleteEmployee(emp.emp_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Employee;