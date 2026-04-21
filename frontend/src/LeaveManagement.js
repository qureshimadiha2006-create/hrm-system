import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  const API_BASE_URL = "https://hrm-system-madiha.onrender.com"; 

  const [view, setView] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);
  const [quota, setQuota] = useState({ pl_quota: 0, cl_quota: 0, sl_quota: 0 });
  
  // Set this to the ID of the employee you want to test (e.g., 1)
  const [currentEmpId, setCurrentEmpId] = useState(1); 
  const [formData, setFormData] = useState({ type: "PL", reason: "", from: "", to: "" });

  useEffect(() => {
    fetchLeaveData();
  }, [currentEmpId]); // Refetch if ID changes

  const fetchLeaveData = async () => {
    try {
      // Notice the ID is now part of the URL path
      const res = await axios.get(`${API_BASE_URL}/leaves/${currentEmpId}`);
      setLeaves(res.data.history || []);
      setQuota(res.data.quota || { pl_quota: 0, cl_quota: 0, sl_quota: 0 });
    } catch (err) {
      console.error("Error fetching leave data:", err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/leaves/apply`, { 
        emp_id: currentEmpId, // Sending ID number
        type: formData.type,
        reason: formData.reason,
        from: formData.from,
        to: formData.to
      });
      
      alert("Leave Applied Successfully!");
      setFormData({ type: "PL", reason: "", from: "", to: "" });
      setView("dashboard");
      fetchLeaveData();
    } catch (err) {
      alert("Submit failed. Make sure Employee ID " + currentEmpId + " exists.");
    }
  };

  return (
    <div className="container mt-4 text-white">
      {/* ID Selector for Testing */}
      <div className="mb-3">
        <label className="me-2">Testing Employee ID:</label>
        <input 
          type="number" 
          className="form-control d-inline-block w-auto" 
          value={currentEmpId} 
          onChange={(e) => setCurrentEmpId(e.target.value)} 
        />
      </div>

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-sm btn-info mx-1" onClick={() => setView("dashboard")}>Dashboard</button>
        <button className="btn btn-sm btn-warning mx-1" onClick={() => setView("apply")}>Apply Leave</button>
      </div>

      {view === "dashboard" && (
        <div>
          <div className="row mb-4">
            <div className="col-md-4"><div className="card bg-danger p-3 text-center"><h5>PL</h5><h3>{quota.pl_quota}</h3></div></div>
            <div className="col-md-4"><div className="card bg-success p-3 text-center"><h5>CL</h5><h3>{quota.cl_quota}</h3></div></div>
            <div className="col-md-4"><div className="card bg-warning p-3 text-center text-dark"><h5>SL</h5><h3>{quota.sl_quota}</h3></div></div>
          </div>
          <table className="table table-dark table-striped">
            <thead>
              <tr><th>Sr.No</th><th>Reason</th><th>Type</th><th>From</th><th>To</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaves.map((l, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{l.reason}</td>
                  <td>{l.leave_type}</td>
                  <td>{new Date(l.from_date).toLocaleDateString()}</td>
                  <td>{new Date(l.to_date).toLocaleDateString()}</td>
                  <td><span className="badge bg-warning">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "apply" && (
        <div className="card bg-dark p-4 border-light mx-auto" style={{maxWidth: "500px"}}>
          <h4>Apply Leave (ID: {currentEmpId})</h4>
          <form onSubmit={handleApplyLeave}>
            <select className="form-select mb-3" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="PL">Paid Leave (PL)</option>
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
            </select>
            <textarea className="form-control mb-3" placeholder="Reason" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            <input type="date" className="form-control mb-3" required value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} />
            <input type="date" className="form-control mb-3" required value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} />
            <button type="submit" className="btn btn-primary w-100">Apply</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;