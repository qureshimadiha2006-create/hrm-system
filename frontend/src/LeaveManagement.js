import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  // 1. Ensure no trailing slash
  const API_BASE_URL = "https://hrm-system-madiha.onrender.com"; 

  const [view, setView] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);
  const [quota, setQuota] = useState({ pl_quota: 0, cl_quota: 0, sl_quota: 0 });
  const [currentEmpId, setCurrentEmpId] = useState(1); 
  const [formData, setFormData] = useState({ type: "PL", reason: "", from: "", to: "" });

  // 2. Added fetchLeaveData as a dependency or move it inside useEffect 
  // to avoid React "exhaustive-deps" warnings which fail Vercel builds
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/leaves/${currentEmpId}`);
        // Ensure res.data exists before setting state
        if (res.data) {
          setLeaves(res.data.history || []);
          setQuota(res.data.quota || { pl_quota: 0, cl_quota: 0, sl_quota: 0 });
        }
      } catch (err) {
        console.error("Error fetching leave data:", err);
      }
    };

    fetchLeaveData();
  }, [currentEmpId]); 

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/leaves/apply`, { 
        emp_id: currentEmpId,
        type: formData.type,
        reason: formData.reason,
        from: formData.from,
        to: formData.to
      });
      
      alert("Leave Applied Successfully!");
      setFormData({ type: "PL", reason: "", from: "", to: "" });
      setView("dashboard");
      
      // Manual trigger of refresh
      const res = await axios.get(`${API_BASE_URL}/leaves/${currentEmpId}`);
      setLeaves(res.data.history || []);
    } catch (err) {
      alert("Submit failed. Make sure Employee ID " + currentEmpId + " exists.");
    }
  };

  return (
    <div className="container mt-4 text-white">
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
        <button className={`btn btn-sm mx-1 ${view === "dashboard" ? "btn-info" : "btn-outline-info"}`} onClick={() => setView("dashboard")}>Dashboard</button>
        <button className={`btn btn-sm mx-1 ${view === "apply" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setView("apply")}>Apply Leave</button>
      </div>

      {view === "dashboard" && (
        <div>
          <div className="row mb-4">
            <div className="col-md-4"><div className="card bg-danger p-3 text-center"><h5>PL</h5><h3>{quota?.pl_quota || 0}</h3></div></div>
            <div className="col-md-4"><div className="card bg-success p-3 text-center"><h5>CL</h5><h3>{quota?.cl_quota || 0}</h3></div></div>
            <div className="col-md-4"><div className="card bg-warning p-3 text-center text-dark"><h5>SL</h5><h3>{quota?.sl_quota || 0}</h3></div></div>
          </div>
          <table className="table table-dark table-striped">
            <thead>
              <tr><th>Sr.No</th><th>Reason</th><th>Type</th><th>From</th><th>To</th><th>Status</th></tr>
            </thead>
            <tbody>
              {/* 3. Safety check: Ensure leaves is an array before mapping */}
              {Array.isArray(leaves) && leaves.length > 0 ? (
                leaves.map((l, index) => (
                  <tr key={l.leave_id || index}> 
                    <td>{index + 1}</td>
                    <td>{l.reason}</td>
                    <td>{l.leave_type}</td>
                    <td>{l.from_date ? new Date(l.from_date).toLocaleDateString() : "N/A"}</td>
                    <td>{l.to_date ? new Date(l.to_date).toLocaleDateString() : "N/A"}</td>
                    <td><span className="badge bg-warning">{l.status || "Pending"}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No leave history found.</td></tr>
              )}
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
            <div className="mb-3"><label>From:</label><input type="date" className="form-control" required value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} /></div>
            <div className="mb-3"><label>To:</label><input type="date" className="form-control" required value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary w-100">Apply</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;