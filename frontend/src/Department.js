import React, { useState, useEffect } from "react";
import axios from "axios";

function Department() {
  const [departments, setDepartments] = useState([]);
  const [dept_name, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:5000/departments");
    setDepartments(res.data);
  };

  const addDepartment = async () => {
    await axios.post("http://localhost:5000/add-department", {
      dept_name,
      description,
    });

    setDeptName("");
    setDescription("");
    fetchDepartments();
  };

  const deleteDepartment = async (id) => {
    await axios.delete(`http://localhost:5000/delete-department/${id}`);
    fetchDepartments();
  };

  return (
    <div>
      <h2>Add Department</h2>

      <input
        type="text"
        placeholder="Department Name"
        value={dept_name}
        onChange={(e) => setDeptName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={addDepartment}>Add</button>

      <h2>Department List</h2>

      <ul>
        {departments.map((dept) => (
          <li key={dept.dept_id}>
            {dept.dept_name} - {dept.description}
            <button onClick={() => deleteDepartment(dept.dept_id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Department;