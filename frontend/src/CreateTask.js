import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTask = ({ goBack }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
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
    let isMounted = true;
    axios.get('https://hrm-system-madiha.onrender.com/employees')
      .then(res => {
        if(isMounted) setEmployees(res.data);
      })
      .catch(err => console.error("Fetch error:", err));
    
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://hrm-system-madiha.onrender.com/add-task', formData);
      alert("Task Created Successfully!");
      if (goBack) goBack(); 
    } catch (err) {
      console.error(err);
      alert("Error creating task. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow p-4 border-0">
        <h2 className="text-center mb-4 fw-bold text-primary">Task Creation</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="fw-bold form-label">Task Title:</label>
            <input 
              type="text" 
              placeholder="Enter Task Title"
              required 
              className="form-control" 
              value={formData.task_title}
              onChange={(e) => setFormData({...formData, task_title: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold form-label">Task Description:</label>
            <textarea 
              required 
              rows="3"
              placeholder="Describe the task details..."
              className="form-control" 
              value={formData.task_description}
              onChange={(e) => setFormData({...formData, task_description: e.target.value})} 
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold form-label">Priority:</label>
              <select className="form-select" onChange={(e) => setFormData({...formData, priority: e.target.value})} value={formData.priority}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold form-label">Assigned To:</label>
              <select required className="form-select" value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.emp_id} value={emp.emp_id}>{emp.emp_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold form-label">Start Date:</label>
              <input type="date" required className="form-control" onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div className="col-md-6 mb-3 text-start">
              <label className="fw-bold form-label">End Date:</label>
              <input type="date" required className="form-control" onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="fw-bold form-label">Task Type:</label>
            <select className="form-select" onChange={(e) => setFormData({...formData, task_type: e.target.value})} value={formData.task_type}>
              <option value="Individual">Individual</option>
              <option value="Team">Team</option>
            </select>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={goBack}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;