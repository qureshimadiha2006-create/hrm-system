import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hrm-system-madiha.onrender.com";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [emp_name, setEmpName] = useState("");
  const [email, setEmail] = useState("");
  const [role_id, setRoleId] = useState("");
  const [dept_id, setDeptId] = useState("");
  const [manager_id, setManagerId] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get(`${BASE_URL}/employees`);
    setEmployees(res.data);
  };

  const fetchRoles = async () => {
    const res = await axios.get(`${BASE_URL}/roles`);
    setRoles(res.data);
  };

  const fetchDepartments = async () => {
    const res = await axios.get(`${BASE_URL}/departments`);
    setDepartments(res.data);
  };

  const handleSubmit = async () => {
    if (!emp_name || !email || !role_id || !dept_id) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      await axios.put(`${BASE_URL}/update-employee/${editId}`, {
        emp_name,
        email,
        role_id,
        dept_id,
        manager_id,
      });
    } else {
      await axios.post(`${BASE_URL}/add-employee`, {
        emp_name,
        email,
        role_id,
        dept_id,
        manager_id,
      });
    }

    setEmpName("");
    setEmail("");
    setRoleId("");
    setDeptId("");
    setManagerId("");
    setEditId(null);

    fetchEmployees();
  };

  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`${BASE_URL}/delete-employee/${id}`);
      fetchEmployees();
    }
  };

  const editEmployee = (emp) => {
    setEmpName(emp.emp_name);
    setEmail(emp.email);
    setRoleId(emp.role_id);
    setDeptId(emp.dept_id);
    setManagerId(emp.manager_id);
    setEditId(emp.emp_id);
  };

  return (
    <div style={{ textAlign: "center" }}>
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

      <br /><br />

      {/* ROLE DROPDOWN */}
      <select value={role_id} onChange={(e) => setRoleId(e.target.value)}>
        <option value="">Select Role</option>
        {roles.map((r) => (
          <option key={r.role_id} value={r.role_id}>
            {r.role_name}
          </option>
        ))}
      </select>

      {/* DEPARTMENT DROPDOWN */}
      <select value={dept_id} onChange={(e) => setDeptId(e.target.value)}>
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d.dept_id} value={d.dept_id}>
            {d.dept_name}
          </option>
        ))}
      </select>

      {/* MANAGER DROPDOWN */}
      <select value={manager_id} onChange={(e) => setManagerId(e.target.value)}>
        <option value="">Select Manager</option>
        {employees.map((e) => (
          <option key={e.emp_id} value={e.emp_id}>
            {e.emp_name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <h2>Employee List</h2>

      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role ID</th>
            <th>Department ID</th>
            <th>Manager</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.emp_id}>
              <td>{emp.emp_name}</td>
              <td>{emp.email}</td>
              <td>{emp.role_id}</td>
              <td>{emp.dept_id}</td>
              <td>{emp.manager_id}</td>
              <td>
                <button onClick={() => editEmployee(emp)}>Edit</button>
                <button onClick={() => deleteEmployee(emp.emp_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Employee;