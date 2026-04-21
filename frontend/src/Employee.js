import React, { useEffect, useState } from "react";
import axios from "axios";

// Ensure no trailing slash here
const BASE_URL = "https://hrm-system-madiha.onrender.com";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Form fields
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

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employees`);
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/roles`);
      setRoles(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/departments`);
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!emp_name || !email || !role_id || !dept_id) {
      alert("Please fill in Name, Email, Role, and Department.");
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
        await axios.put(`${BASE_URL}/update-employee/${editId}`, payload);
      } else {
        await axios.post(`${BASE_URL}/add-employee`, payload);
      }

      alert(editId ? "✅ Employee Updated" : "✅ Employee Added");
      resetForm();
      fetchEmployees();
    } catch (err) {
      alert("Error saving employee. Check console.");
    }
  };

  // --- UPDATED DELETE LOGIC ---
  // Using .put because our server uses soft-delete (is_deleted = TRUE)
  const deleteEmployee = async (id) => {
    if (window.confirm(`Are you sure you want to delete Employee ID: ${id}?`)) {
      try {
        await axios.put(`${BASE_URL}/delete-employee/${id}`);
        fetchEmployees();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

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

  const resetForm = () => {
    setEmpName(""); setEmail(""); setPhone(""); setAddress("");
    setRegion(""); setRoleId(""); setDeptId(""); setManagerId("");
    setEditId(null);
  };

  return (
    <div style={{ padding: "20px", color: "white", backgroundColor: "#212529", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "auto", textAlign: "center" }}>
        <h2 className="mb-4">{editId ? "Update Employee" : "Register New Employee"}</h2>

        {/* FORM SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <input className="form-control" placeholder="Full Name" value={emp_name} onChange={(e) => setEmpName(e.target.value)} />
          <input className="form-control" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="form-control" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="form-control" placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} />
          
          <select className="form-select" value={role_id} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">Select Role</option>
            {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
          </select>

          <select className="form-select" value={dept_id} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
          </select>
        </div>

        <button className="btn btn-primary w-100 mb-5" onClick={handleSubmit}>
          {editId ? "Save Changes" : "Add Employee"}
        </button>

        {/* TABLE SECTION */}
        <h3>Active Employees</h3>
        <table className="table table-dark table-hover border">
          <thead>
            <tr>
              <th>ID</th> {/* <--- Employee ID added here */}
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map((emp) => (
              <tr key={emp.emp_id}>
                <td style={{ fontWeight: "bold", color: "#0dcaf0" }}>{emp.emp_id}</td>
                <td>{emp.emp_name}</td>
                <td>{emp.email}</td>
                <td>{emp.role_name || "N/A"}</td>
                <td>{emp.dept_name || "N/A"}</td>
                <td>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => editEmployee(emp)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEmployee(emp.emp_id)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employee;