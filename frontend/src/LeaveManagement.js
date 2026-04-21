import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  // Removed trailing slash to prevent //leaves errors
  const API_BASE_URL = "https://hrm-system-madiha.onrender.com"; 

  const [view, setView] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);
  const [quota, setQuota] = useState({ pl_quota: 0, cl_quota: 0, sl_quota: 0 });
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({ type: "PL", reason: "", from: "", to: "" });

  // This email MUST exist in your database for the apply to work
  const currentEmpEmail ="qureshimadiha2006@gmail.com"; 

  useEffect(() => {
    fetchLeaveData();
    fetchEmployees();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaves?email=${currentEmpEmail}`);
      setLeaves(res.data.history || []);
      if (res.data.quota) setQuota(res.data.quota);
    } catch (err) {
      console.error("Error fetching leave data:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Could not load employees:", err);
    }
  };

  // --- UPDATED APPLY LOGIC ---
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      // We send 'email' instead of 'emp_id' so the server can look it up
      await axios.post(`${API_BASE_URL}/leaves/apply`, { 
        email: currentEmpEmail,
        type: formData.type,
        reason: formData.reason,
        from: formData.from,
        to: formData.to
      });
      
      alert("Leave Application Submitted Successfully!");
      setFormData({ type: "PL", reason: "", from: "", to: "" }); // Reset form
      setView("dashboard");
      fetchLeaveData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Submit failed. Check console for details.");
    }
  };

  return (
    <div className="container mt-4 text-white">
      <div className="d-flex justify-content-end mb-4">
        <button className={`btn btn-sm mx-1 ${view === "dashboard" ? "btn-info" : "btn-outline-info"}`} onClick={() => setView("dashboard")}>Dashboard</button>
        <button className={`btn btn-sm mx-1 ${view === "apply" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setView("apply")}>Apply Leave</button>
        <button className={`btn btn-sm mx-1 ${view === "admin" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setView("admin")}>Admin Section</button>
      </div>

      {view === "dashboard" && (
        <div>
          <div className="row mb-4">
            <div className="col-md-4"><div className="card bg-danger p-3 text-center"><h5>PL</h5><h3>{quota.pl_quota || 0}</h3></div></div>
            <div className="col-md-4"><div className="card bg-success p-3 text-center"><h5>CL</h5><h3>{quota.cl_quota || 0}</h3></div></div>
            <div className="col-md-4"><div className="card bg-warning p-3 text-center text-dark"><h5>SL</h5><h3>{quota.sl_quota || 0}</h3></div></div>
          </div>
          <table className="table table-dark table-striped mt-4">
            <thead>
              <tr><th>Sr.No</th><th>Reason</th><th>Type</th><th>From</th><th>To</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? leaves.map((l, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{l.reason}</td>
                  <td>{l.leave_type}</td>
                  <td>{new Date(l.from_date).toLocaleDateString()}</td>
                  <td>{new Date(l.to_date).toLocaleDateString()}</td>
                  <td><span className="badge bg-warning">{l.status}</span></td>
                </tr>
              )) : <tr><td colSpan="6">No leave history found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === "apply" && (
        <div className="card bg-dark p-4 border-light mx-auto" style={{maxWidth: "500px"}}>
          <h4 className="mb-3">Apply Leave</h4>
          <form onSubmit={handleApplyLeave}>
            <select className="form-select mb-3" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="PL">Paid Leave (PL)</option>
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
            </select>
            <textarea className="form-control mb-3" placeholder="Reason" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            <div className="mb-3 text-start"><label>From:</label><input type="date" className="form-control" required value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} /></div>
            <div className="mb-3 text-start"><label>To:</label><input type="date" className="form-control" required value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary w-100">Apply</button>
          </form>
        </div>
      )}

      {view === "admin" && (
        <div className="card bg-dark p-4 border-info text-center">
          <h4>Admin Section</h4>
          <p>Select an employee to manage their quota.</p>
          <select className="form-select w-50 mx-auto">
            <option>Select Employee</option>
            {employees.map((emp, i) => <option key={i} value={emp.email}>{emp.emp_name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;