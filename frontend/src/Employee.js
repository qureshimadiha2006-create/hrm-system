import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hrm-system-madiha.onrender.com";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Employee fields
  const [emp_name, setEmpName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");

  const [role_id, setRoleId] = useState("");
  const [dept_id, setDeptId] = useState("");
  const [manager_id, setManagerId] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    fetchDepartments();
  }, []);

  // ---------------- FETCH DATA ----------------
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/roles`);
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- ADD / UPDATE ----------------
  const handleSubmit = async () => {
    if (!emp_name || !email || !role_id || !dept_id) {
      alert("Fill required fields");
      return;
    }

    try {
      const payload = {
        emp_name,
        email,
        phone,
        address,
        region,
        role_id: parseInt(role_id),
        dept_id: parseInt(dept_id),
        manager_id: manager_id ? parseInt(manager_id) : null
      };

      if (editId) {
        await axios.put(
          `${BASE_URL}/update-employee/${editId}`,
          payload
        );
      } else {
        await axios.post(`${BASE_URL}/add-employee`, payload);
      }

      alert(editId ? "✅ Employee Updated" : "✅ Employee Added");

      // RESET FORM
      setEmpName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setRegion("");
      setRoleId("");
      setDeptId("");
      setManagerId("");
      setEditId(null);

      fetchEmployees();
    } catch (err) {
      console.error("ERROR:", err);
      alert("Error saving employee");
    }
  };

  // ---------------- DELETE ----------------
  const deleteEmployee = async (id) => {
    if (window.confirm("Delete this employee?")) {
      await axios.delete(`${BASE_URL}/delete-employee/${id}`);
      fetchEmployees();
    }
  };

  // ---------------- EDIT ----------------
  const editEmployee = (emp) => {
    setEmpName(emp.emp_name);
    setEmail(emp.email);
    setPhone(emp.phone || "");
    setAddress(emp.address || "");
    setRegion(emp.region || "");

    setRoleId(emp.role_id);
    setDeptId(emp.dept_id);
    setManagerId(emp.manager_id || "");

    setEditId(emp.emp_id);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{editId ? "Update Employee" : "Add Employee"}</h2>

      {/* BASIC INFO */}
      <input
        placeholder="Name"
        value={emp_name}
        onChange={(e) => setEmpName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        placeholder="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />

      <br /><br />

      {/* ROLE */}
      <select value={role_id} onChange={(e) => setRoleId(e.target.value)}>
        <option value="">Select Role</option>
        {roles.map((r) => (
          <option key={r.role_id} value={r.role_id}>
            {r.role_name}
          </option>
        ))}
      </select>

      {/* DEPARTMENT */}
      <select value={dept_id} onChange={(e) => setDeptId(e.target.value)}>
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d.dept_id} value={d.dept_id}>
            {d.dept_name}
          </option>
        ))}
      </select>

      {/* MANAGER */}
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
        {editId ? "Update Employee" : "Add Employee"}
      </button>

      {/* TABLE */}
      <h3>Employee List</h3>

      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Region</th>
            <th>Role</th>
            <th>Department</th>
            <th>Manager</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.emp_id}>
              <td>{emp.emp_name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.region}</td>

              <td>{emp.role_name || emp.role_id}</td>
              <td>{emp.dept_name || emp.dept_id}</td>
              <td>{emp.manager_name || "-"}</td>

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