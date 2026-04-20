import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('https://hrm-system-madiha.onrender.com/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.log("Fetch error:", err));
  };

  const handleMarkCompleted = async (id) => {
    try {
      await axios.put(`https://hrm-system-madiha.onrender.com/update-task-status/${id}`, { status: 'Completed' });
      fetchTasks();
    } catch (err) { alert("Error updating status"); }
  };

  const handleDelete = async (id) => {
    // PDF Requirement: Warning popup before deletion
    if (window.confirm("Are you sure you want to delete this task?")) { 
      try {
        await axios.delete(`https://hrm-system-madiha.onrender.com/delete-task/${id}`);
        fetchTasks();
      } catch (err) { alert("Error deleting task"); }
    }
  };

  // Logic for Statistics (Matches PDF Section)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  // Logic for Filtering by Status and Date Range (Matches PDF Section)
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'All' || task.status === filterStatus;
    const taskDate = new Date(task.start_date);
    const dateMatch = (!fromDate || taskDate >= new Date(fromDate)) && 
                      (!toDate || taskDate <= new Date(toDate));
    return statusMatch && dateMatch;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Task Management Dashboard</h2>

      {/* --- STATISTICS BOXES --- */}
      <div className="row mb-4 text-white text-center">
        <div className="col-md-3">
          <div className="bg-primary p-3 rounded shadow">
            <h5>Total Tasks</h5>
            <h3>{totalTasks}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-success p-3 rounded shadow">
            <h5>Completed</h5>
            <h3>{completedTasks}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-info p-3 rounded shadow">
            <h5>In Progress</h5>
            <h3>{inProgressTasks}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-warning p-3 rounded shadow text-dark">
            <h5>Pending</h5>
            <h3>{pendingTasks}</h3>
          </div>
        </div>
      </div>

      {/* --- FILTERS SECTION --- */}
      <div className="row mb-3 p-3 bg-light rounded shadow-sm">
        <div className="col-md-4">
          <label className="fw-bold">Filter By Status:</label>
          <select className="form-select" onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="fw-bold">From Date:</label>
          <input type="date" className="form-control" onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className="fw-bold">To Date:</label>
          <input type="date" className="form-control" onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      {/* --- TASK TABLE --- */}
      <div className="table-responsive">
        <table className="table table-hover shadow-sm border">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Task Title</th>
              <th>Priority</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.task_id}>
                <td>{task.emp_name}</td>
                <td>{task.task_title}</td>
                <td>
                  <span className={`badge ${task.priority === 'High' ? 'bg-danger' : 'bg-secondary'}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{new Date(task.start_date).toLocaleDateString()}</td>
                <td>{new Date(task.end_date).toLocaleDateString()}</td>
                <td><span className="text-muted fw-bold">{task.status}</span></td>
                <td>
                  {/* PDF Requirement: See Details button */}
                  <button className="btn btn-sm btn-info me-1" onClick={() => alert(task.task_description)}>
                    Details
                  </button>
                  {task.status !== 'Completed' && (
                    <button onClick={() => handleMarkCompleted(task.task_id)} className="btn btn-sm btn-success me-1">
                      Complete
                    </button>
                  )}
                  {/* PDF Requirement: Delete with warning */}
                  <button onClick={() => handleDelete(task.task_id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
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