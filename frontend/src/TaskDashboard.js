import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All'); // Now being used correctly

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('https://hrm-system-madiha.onrender.com/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error("Fetch error:", err));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`https://hrm-system-madiha.onrender.com/delete-task/${id}`);
        fetchTasks();
      } catch (err) { alert("Error deleting task"); }
    }
  };

  // STATISTICS LOGIC
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  // FILTER LOGIC - Fixed the 'unused variable' error here
  const filteredTasks = filterStatus === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Task Management Dashboard</h2>

      {/* STATISTICS BOXES */}
      <div className="row mb-4 text-white text-center">
        <div className="col-md-3"><div className="bg-primary p-3 rounded shadow"><h5>Total</h5><h3>{totalTasks}</h3></div></div>
        <div className="col-md-3"><div className="bg-success p-3 rounded shadow"><h5>Completed</h5><h3>{completedTasks}</h3></div></div>
        <div className="col-md-3"><div className="bg-info p-3 rounded shadow"><h5>In Progress</h5><h3>{inProgressTasks}</h3></div></div>
        <div className="col-md-3"><div className="bg-warning p-3 rounded shadow text-dark"><h5>Pending</h5><h3>{pendingTasks}</h3></div></div>
      </div>

      {/* FILTER DROPDOWN */}
      <div className="row mb-3 p-3 bg-light rounded shadow-sm">
        <div className="col-md-4">
          <label className="fw-bold">Filter By Status:</label>
          <select 
            className="form-select" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} // setFilterStatus is now used
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* TASK TABLE */}
      <div className="table-responsive">
        <table className="table table-hover shadow-sm border">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Task Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.task_id}>
                <td>{task.emp_name}</td>
                <td>{task.task_title}</td>
                <td><span className={`badge ${task.priority === 'High' ? 'bg-danger' : 'bg-secondary'}`}>{task.priority}</span></td>
                <td>{task.status}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2" onClick={() => alert(task.task_description)}>Details</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.task_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskDashboard;