import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hrm-system-madiha.onrender.com";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [deletedDepartments, setDeletedDepartments] = useState([]);

  const [dept_name, setDeptName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchDeletedDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get(`${BASE_URL}/departments`);
    setDepartments(res.data);
  };

  const fetchDeletedDepartments = async () => {
    const res = await axios.get(`${BASE_URL}/deleted-departments`);
    setDeletedDepartments(res.data);
  };

  const handleSubmit = async () => {
    if (!dept_name || !description) {
      alert("Fill all fields");
      return;
    }

    if (editId) {
      await axios.put(`${BASE_URL}/update-department/${editId}`, {
        dept_name,
        description,
      });
    } else {
      await axios.post(`${BASE_URL}/add-department`, {
        dept_name,
        description,
      });
    }

    setDeptName("");
    setDescription("");
    setEditId(null);

    fetchDepartments();
    fetchDeletedDepartments();
  };

  const deleteDepartment = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`${BASE_URL}/delete-department/${id}`);
      fetchDepartments();
      fetchDeletedDepartments();
    }
  };

  const restoreDepartment = async (id) => {
    await axios.put(`${BASE_URL}/restore-department/${id}`);
    fetchDepartments();
    fetchDeletedDepartments();
  };

  const editDepartment = (dept) => {
    setDeptName(dept.dept_name);
    setDescription(dept.description);
    setEditId(dept.dept_id);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Department</h2>

      <input
        placeholder="Department Name"
        value={dept_name}
        onChange={(e) => setDeptName(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <h3>Active Departments</h3>

      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((d) => (
            <tr key={d.dept_id}>
              <td>{d.dept_id}</td>
              <td>{d.dept_name}</td>
              <td>{d.description}</td>
              <td>
                <button onClick={() => editDepartment(d)}>Edit</button>
                <button onClick={() => deleteDepartment(d.dept_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Deleted Departments</h3>

      <table border="1" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Restore</th>
          </tr>
        </thead>

        <tbody>
          {deletedDepartments.map((d) => (
            <tr key={d.dept_id}>
              <td>{d.dept_id}</td>
              <td>{d.dept_name}</td>
              <td>{d.description}</td>
              <td>
                <button onClick={() => restoreDepartment(d.dept_id)}>
                  Restore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Department;