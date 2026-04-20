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
      .catch(err => console.log(err));
  };

  const handleMarkCompleted = async (id) => {
    try {
      await axios.put(`https://hrm-system-madiha.onrender.com/update-task-status/${id}`, { status: 'Completed' });
      fetchTasks();
    } catch (err) { alert("Error updating status"); }
  };

  // Logic for Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  // Logic for Filtering
  const filteredTasks = filterStatus === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="container mt-4">
      <h2>Task Management Dashboard</h2>

      {/* --- STATISTICS BOXES --- */}
      <div className="row my-4 text-white">
        <div className="col-md-4">
          <div className="bg-primary p-3 rounded shadow">
            <h4>Total Tasks</h4>
            <h2>{totalTasks}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-success p-3 rounded shadow">
            <h4>Completed</h4>
            <h2>{completedTasks}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-warning p-3 rounded shadow text-dark">
            <h4>Pending</h4>
            <h2>{pendingTasks}</h2>
          </div>
        </div>
      </div>

      {/* --- FILTER SECTION --- */}
      <div className="mb-3 d-flex align-items-center">
        <label className="me-2 fw-bold">Filter By Status:</label>
        <select className="form-select w-25" onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Tasks</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* --- TASK TABLE --- */}
      <table className="table table-hover table-striped shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Employee</th>
            <th>Task Title</th>
            <th>Priority</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.task_id}>
              <td>{task.emp_name}</td>
              <td>{task.task_title}</td>
              <td>
                <span className={`badge ${task.priority === 'High' ? 'bg-danger' : 'bg-info'}`}>
                  {task.priority}
                </span>
              </td>
              <td>{new Date(task.end_date).toLocaleDateString()}</td>
              <td>{task.status}</td>
              <td>
                {task.status !== 'Completed' && (
                  <button onClick={() => handleMarkCompleted(task.task_id)} className="btn btn-sm btn-outline-success me-2">
                    Mark Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskDashboard;