import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTask = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    task_title: '',
    task_description: '',
    priority: 'Medium',
    assigned_to: '',
    start_date: '',
    end_date: '',
    task_type: 'Individual'
  });

  // Fetch employees to fill the "Assigned To" dropdown
  useEffect(() => {
    axios.get('https://hrm-system-madiha.onrender.com/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://hrm-system-madiha.onrender.com/add-task', formData);
      alert("Task Created Successfully!");
      // Optional: Redirect to Dashboard here
    } catch (err) {
      alert("Error creating task");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Task Creation</h2>
      <form onSubmit={handleSubmit}>
        <label>Task Title:</label>
        <input type="text" required onChange={(e) => setFormData({...formData, task_title: e.target.value})} className="form-control mb-2" />

        <label>Task Description:</label>
        <textarea required onChange={(e) => setFormData({...formData, task_description: e.target.value})} className="form-control mb-2" />

        <label>Priority:</label>
        <select onChange={(e) => setFormData({...formData, priority: e.target.value})} className="form-control mb-2">
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <label>Assigned To:</label>
        <select required onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} className="form-control mb-2">
          <option value="">Select Employee</option>
          {employees.map(emp => (
            <option key={emp.emp_id} value={emp.emp_id}>{emp.emp_name}</option>
          ))}
        </select>

        <label>Start Date:</label>
        <input type="date" required onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="form-control mb-2" />

        <label>End Date:</label>
        <input type="date" required onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="form-control mb-2" />

        <label>Task Type:</label>
        <select onChange={(e) => setFormData({...formData, task_type: e.target.value})} className="form-control mb-3">
          <option value="Individual">Individual</option>
          <option value="Team">Team</option>
        </select>

        <button type="submit" className="btn btn-primary">Create Task</button>
      </form>
    </div>
  );
};

export default CreateTask;