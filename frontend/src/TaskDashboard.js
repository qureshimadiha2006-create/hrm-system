import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('https://hrm-system-madiha.onrender.com/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error("Fetch error:", err));
  };

  const handleDelete = async (id) => {
    // PDF Requirement: Warning popup for deletion [cite: 148]
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`https://hrm-system-madiha.onrender.com/delete-task/${id}`);
        fetchTasks();
      } catch (err) { alert("Error deleting task"); }
    }
  };

  // Logic for Statistics [cite: 69, 136]
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  const filteredTasks = filterStatus === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="container mt-4">
      <h2>Task Management Dashboard</h2>

      {/* --- STATISTICS BOXES [cite: 50, 136] --- */}
      <div className="row my-4 text-white">
        <div className="col-md-3"><div className="bg-primary p-3 rounded"><h4>Total</h4><h2>{totalTasks}</h2></div></div>
        <div className="col-md-3"><div className="bg-success p-3 rounded"><h4>Completed</h4><h2>{completedTasks}</h2></div></div>
        <div className="col-md-3"><div className="bg-info p-3 rounded"><h4>In Progress</h4><h2>{inProgressTasks}</h2></div></div>
        <div className="col-md-3"><div className="bg-warning p-3 rounded text-dark"><h4>Pending</h4><h2>{pendingTasks}</h2></div></div>
      </div>

      <table className="table table-striped shadow-sm mt-4">
        <thead className="table-dark">
          <tr>
            <th>Employee</th>
            <th>Task Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.task_id}>
              <td>{task.emp_name}</td>
              <td>{task.task_title}</td>
              <td>{task.status}</td>
              <td>
                {/* PDF Requirement: See details [cite: 66, 118] */}
                <button className="btn btn-sm btn-info me-2" onClick={() => alert(task.task_description)}>Details</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.task_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskDashboard;