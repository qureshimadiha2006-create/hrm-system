import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hrm-system-madiha.onrender.com";

function Role() {
  const [roles, setRoles] = useState([]);
  const [deletedRoles, setDeletedRoles] = useState([]);

  const [role_name, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchDeletedRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await axios.get(`${BASE_URL}/roles`);
    setRoles(res.data);
  };

  const fetchDeletedRoles = async () => {
    const res = await axios.get(`${BASE_URL}/deleted-roles`);
    setDeletedRoles(res.data);
  };

  const handleSubmit = async () => {
    if (!role_name || !description) {
      alert("Fill all fields");
      return;
    }

    if (editId) {
      await axios.put(`${BASE_URL}/update-role/${editId}`, {
        role_name,
        description,
      });
    } else {
      await axios.post(`${BASE_URL}/add-role`, {
        role_name,
        description,
      });
    }

    setRoleName("");
    setDescription("");
    setEditId(null);

    fetchRoles();
    fetchDeletedRoles();
  };

  const deleteRole = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`${BASE_URL}/delete-role/${id}`);
      fetchRoles();
      fetchDeletedRoles();
    }
  };

  const restoreRole = async (id) => {
    await axios.put(`${BASE_URL}/restore-role/${id}`);
    fetchRoles();
    fetchDeletedRoles();
  };

  const editRole = (role) => {
    setRoleName(role.role_name);
    setDescription(role.description);
    setEditId(role.role_id);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Role Management</h2>

      <input
        placeholder="Role Name"
        value={role_name}
        onChange={(e) => setRoleName(e.target.value)}
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

      <h3>Active Roles</h3>

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
          {roles.map((r) => (
            <tr key={r.role_id}>
              <td>{r.role_id}</td>
              <td>{r.role_name}</td>
              <td>{r.description}</td>
              <td>
                <button onClick={() => editRole(r)}>Edit</button>
                <button onClick={() => deleteRole(r.role_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Deleted Roles</h3>

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
          {deletedRoles.map((r) => (
            <tr key={r.role_id}>
              <td>{r.role_id}</td>
              <td>{r.role_name}</td>
              <td>{r.description}</td>
              <td>
                <button onClick={() => restoreRole(r.role_id)}>
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

export default Role;