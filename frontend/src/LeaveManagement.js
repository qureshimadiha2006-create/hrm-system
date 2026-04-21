import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
  const [view, setView] = useState("dashboard"); // dashboard, apply, or admin
  const [leaves, setLeaves] = useState([]);
  const [quota, setQuota] = useState({ pl_quota: 0, cl_quota: 0, sl_quota: 0 });
  const [employees, setEmployees] = useState([]); // For Admin dropdown
  
  // Form States
  const [formData, setFormData] = useState({ type: "PL", reason: "", from: "", to: "" });
  const [quotaData, setQuotaData] = useState({ emp_id: "", pl: 0, cl: 0, sl: 0 });

  // Use a hardcoded Emp ID for testing or get it from your login state
  const currentEmpId = 1; 

  useEffect(() => {
    fetchLeaveData();
    fetchEmployees();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/leaves/${currentEmpId}`);
      setLeaves(res.data.history);
      if (res.data.quota) setQuota(res.data.quota);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/employees");
    setEmployees(res.data);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/leaves/apply", { ...formData, emp_id: currentEmpId });
    alert("Leave Applied!");
    setView("dashboard");
    fetchLeaveData();
  };

  const handleUpdateQuota = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/leaves/quota", {
      emp_id: quotaData.emp_id,
      pl_quota: quotaData.pl,
      cl_quota: quotaData.cl,
      sl_quota: quotaData.sl
    });
    alert("Quota Updated!");
    setQuotaData({ emp_id: "", pl: 0, cl: 0, sl: 0 });
  };

  return (
    <div className="container mt-4 text-white">
      {/* HEADER NAVIGATION */}
      <div className="d-flex justify-content-between mb-4">
        <h2>Leave Management</h2>
        <div>
          <button className="btn btn-outline-info me-2" onClick={() => setView("dashboard")}>Dashboard</button>
          <button className="btn btn-outline-warning me-2" onClick={() => setView("apply")}>Apply Leave</button>
          <button className="btn btn-outline-danger" onClick={() => setView("admin")}>Admin Section</button>
        </div>
      </div>

      {/* SECTION 1: LEAVE DASHBOARD */}
      {view === "dashboard" && (
        <div>
          <div className="row mb-4">
            <div className="col-md-4"><div className="card bg-primary p-3 text-center"><h5>PL Balance</h5><h3>{quota.pl_quota}</h3></div></div>
            <div className="col-md-4"><div className="card bg-success p-3 text-center"><h5>CL Balance</h5><h3>{quota.cl_quota}</h3></div></div>
            <div className="col-md-4"><div className="card bg-danger p-3 text-center"><h5>SL Balance</h5><h3>{quota.sl_quota}</h3></div></div>
          </div>
          <h4>My Leave History</h4>
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.leave_id}>
                  <td>{l.reason}</td>
                  <td>{l.leave_type}</td>
                  <td>{new Date(l.from_date).toLocaleDateString()}</td>
                  <td>{new Date(l.to_date).toLocaleDateString()}</td>
                  <td><span className={`badge ${l.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 2: APPLY LEAVE FORM */}
      {view === "apply" && (
        <div className="card bg-dark p-4 border-light">
          <h4>Apply for Leave</h4>
          <form onSubmit={handleApplyLeave}>
            <div className="mb-3">
              <label>Leave Type</label>
              <select className="form-control" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="PL">Paid Leave (PL)</option>
                <option value="CL">Casual Leave (CL)</option>
                <option value="SL">Sick Leave (SL)</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Reason</label>
              <textarea className="form-control" required onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            </div>
            <div className="row">
              <div className="col"><label>From</label><input type="date" className="form-control" required onChange={(e) => setFormData({...formData, from: e.target.value})} /></div>
              <div className="col"><label>To</label><input type="date" className="form-control" required onChange={(e) => setFormData({...formData, to: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn-warning mt-3 w-100">Submit Application</button>
          </form>
        </div>
      )}

      {/* SECTION 3: ADMIN/MANAGER SECTION */}
      {view === "admin" && (
        <div className="card bg-dark p-4 border-info">
          <h4>Set Employee Leave Quota</h4>
          <form onSubmit={handleUpdateQuota} className="row g-3 mb-4">
            <div className="col-md-3">
              <select className="form-control" required onChange={(e) => setQuotaData({...quotaData, emp_id: e.target.value})}>
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.emp_id} value={e.emp_id}>{e.emp_name}</option>)}
              </select>
            </div>
            <div className="col-md-2"><input type="number" placeholder="PL" className="form-control" onChange={(e) => setQuotaData({...quotaData, pl: e.target.value})} /></div>
            <div className="col-md-2"><input type="number" placeholder="CL" className="form-control" onChange={(e) => setQuotaData({...quotaData, cl: e.target.value})} /></div>
            <div className="col-md-2"><input type="number" placeholder="SL" className="form-control" onChange={(e) => setQuotaData({...quotaData, sl: e.target.value})} /></div>
            <div className="col-md-3"><button type="submit" className="btn btn-info w-100">Update Quota</button></div>
          </form>
          <p className="text-muted small">* Note: In a full system, an approval table for managers would appear here.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;