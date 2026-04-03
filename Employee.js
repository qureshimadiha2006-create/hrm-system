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
    setEmployees(employees.filter((emp) => emp.emp_id !== id));
  };

  const editEmployee = (emp) => {
    setEmpName(emp.emp_name);
    setEmail(emp.email);
    setDept(emp.dept);
    setEditId(emp.emp_id);
  };

  return (
    <div>
      <h2>{editId ? "Edit Employee" : "Add Employee"}</h2>

      <input
        placeholder="Employee Name"
        value={emp_name}
        onChange={(e) => setEmpName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Department"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <h2>Employee List</h2>

      <ul>
        {employees.map((emp) => (
          <li key={emp.emp_id}>
            {emp.emp_name} - {emp.email} - {emp.dept}

            <button onClick={() => editEmployee(emp)}>
              Edit
            </button>

            <button onClick={() => deleteEmployee(emp.emp_id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Employee;