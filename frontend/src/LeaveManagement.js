import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  // FIX: Removed the trailing slash at the end
  const API_BASE_URL = "https://hrm-system-madiha.onrender.com"; 

  const [view, setView] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);
  const [quota, setQuota] = useState({ pl_quota: 0, cl_quota: 0, sl_quota: 0 });
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({ type: "PL", reason: "", from: "", to: "" });

  // Current logged-in user
  const currentEmpEmail = "madihaqureshimadiha2006@gmail.com"; 

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
      console.error("Could not load employees from backend:", err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/leaves/apply`, { 
        ...formData, 
        email: currentEmpEmail 
      });
      alert("Leave Application Submitted!");
      setView("dashboard");
      fetchLeaveData();
    } catch (err) {
      alert("Submit failed. Make sure the backend is updated and running.");
    }
  };

  return (
    <div className="container mt-4 text-white">
      <div className="d-flex justify-content-end mb-4">
        <button className={`btn btn-outline-info me-2 ${view === "dashboard" && "active"}`} onClick={() => setView("dashboard")}>Dashboard</button>
        <button className={`btn btn-outline-warning me-2 ${view === "apply" && "active"}`} onClick={() => setView("apply")}>Apply Leave</button>
        <button className={`btn btn-outline-danger ${view === "admin" && "active"}`} onClick={() => setView("admin")}>Admin Section</button>
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
          <h4 className="mb-3">Apply Leave</h4>
          <form onSubmit={handleApplyLeave}>
            <select className="form-select mb-3" onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="PL">Paid Leave (PL)</option>
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
            </select>
            <textarea className="form-control mb-3" placeholder="Reason" required onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            <div className="mb-3 text-start"><label>From:</label><input type="date" className="form-control" required onChange={(e) => setFormData({...formData, from: e.target.value})} /></div>
            <div className="mb-3 text-start"><label>To:</label><input type="date" className="form-control" required onChange={(e) => setFormData({...formData, to: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary w-100">Apply</button>
          </form>
        </div>
      )}

      {view === "admin" && (
        <div className="card bg-dark p-4 border-info text-center">
          <h4>Admin Section</h4>
          <p>This section is for managing all employee leaves.</p>
          {/* Employee list will load here once API is live */}
          <select className="form-select w-50 mx-auto">
            <option>Select Employee to Update Quota</option>
            {employees.map((emp, i) => <option key={i} value={emp.email}>{emp.emp_name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;