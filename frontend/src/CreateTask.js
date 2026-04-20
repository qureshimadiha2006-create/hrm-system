import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTask = ({ goBack }) => {
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

  useEffect(() => {
    axios.get('https://hrm-system-madiha.onrender.com/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://hrm-system-madiha.onrender.com/add-task', formData);
      alert("Task Created Successfully!");
      if (goBack) goBack(); 
    } catch (err) {
      alert("Error creating task");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Task Creation</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="fw-bold">Task Title:</label>
            <input 
              type="text" 
              placeholder="Enter Task Title"
              required 
              className="form-control" 
              onChange={(e) => setFormData({...formData, task_title: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Enter Task Description:</label>
            <textarea 
              required 
              className="form-control" 
              onChange={(e) => setFormData({...formData, task_description: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Select Task priority:</label>
            <select className="form-select" onChange={(e) => setFormData({...formData, priority: e.target.value})} value={formData.priority}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Assigned To:</label>
            <select required className="form-select" onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.emp_id} value={emp.emp_id}>{emp.emp_name}</option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold">Start date:</label>
              <input type="date" required className="form-control" onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold">End date:</label>
              <input type="date" required className="form-control" onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="fw-bold">Select Task Type:</label>
            <select className="form-select" onChange={(e) => setFormData({...formData, task_type: e.target.value})} value={formData.task_type}>
              <option value="Individual">Individual</option>
              <option value="Team">Team</option>
            </select>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">Create Task</button>
            <button type="button" className="btn btn-secondary" onClick={goBack}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;