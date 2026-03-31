import React, { useState, useEffect } from "react";
import axios from "axios";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [dept_name, setDeptName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const BASE_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    fetchDepartments();
  }, []);

  // FETCH DATA
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/departments`);
      setDepartments(res.data);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  // ADD or UPDATE
  const handleSubmit = async () => {
    try {
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
    } catch (error) {
      console.log("SUBMIT ERROR:", error);
    }
  };

  // DELETE
  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/delete-department/${id}`);
      fetchDepartments();
    } catch (error) {
      console.log("DELETE ERROR:", error);
    }
  };

  // EDIT
  const editDepartment = (dept) => {
    setDeptName(dept.dept_name);
    setDescription(dept.description);
    setEditId(dept.dept_id);
  };

  return (
    <div style={{ width: "60%", margin: "auto", textAlign: "center" }}>
      <h1>Department Management</h1>

      <h3>{editId ? "Edit Department" : "Add Department"}</h3>

      <input
        style={{ margin: "5px", padding: "5px" }}
        type="text"
        placeholder="Department Name"
        value={dept_name}
        onChange={(e) => setDeptName(e.target.value)}
      />

      <input
        style={{ margin: "5px", padding: "5px" }}
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />

      <button onClick={handleSubmit} style={{ margin: "10px", padding: "8px" }}>
        {editId ? "Update" : "Add"}
      </button>

      <h2>Department List</h2>

      <table border="1" cellPadding="10" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Department Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((dept) => (
            <tr key={dept.dept_id}>
              <td>{dept.dept_id}</td>
              <td>{dept.dept_name}</td>
              <td>{dept.description}</td>
              <td>
                <button
                  onClick={() => editDepartment(dept)}
                  style={{ marginRight: "5px" }}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteDepartment(dept.dept_id)}
                >
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

export default Department;