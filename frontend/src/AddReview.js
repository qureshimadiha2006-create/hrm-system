import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddReview = ({ goBack }) => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    review_title: '',
    emp_id: '',
    review_date: '',
    review_period: 'Monthly',
    rating: '',
    comment: ''
  });

  useEffect(() => {
    // Fetches only employees reporting to the logged-in manager
    axios.get('https://hrm-system-madiha.onrender.com/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://hrm-system-madiha.onrender.com/add-review', formData)
      .then(() => {
        alert("Review Added Successfully!");
        if (goBack) goBack();
      })
      .catch(() => alert("Error adding review"));
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-4">
        <h3 className="mb-4">Add Review</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="fw-bold">Review Title:</label>
            <input type="text" className="form-control" required onChange={(e) => setFormData({...formData, review_title: e.target.value})} />
          </div>
          <div className="mb-3 text-start">
            <label className="fw-bold">Select Employee:</label>
            <select className="form-select" required onChange={(e) => setFormData({...formData, emp_id: e.target.value})}>
              <option value="">Open this select menu</option>
              {employees.map(emp => <option key={emp.emp_id} value={emp.emp_id}>{emp.emp_name}</option>)}
            </select>
          </div>
          <div className="mb-3 text-start">
            <label className="fw-bold">Review Date:</label>
            <input type="date" className="form-control" required onChange={(e) => setFormData({...formData, review_date: e.target.value})} />
          </div>
          <div className="mb-3 text-start">
            <label className="fw-bold">Review Period:</label>
            <select className="form-select" onChange={(e) => setFormData({...formData, review_period: e.target.value})}>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>
          <div className="mb-3 text-start">
            <label className="fw-bold">Enter Rating (1-10):</label>
            <input type="number" min="1" max="10" className="form-control" required onChange={(e) => setFormData({...formData, rating: e.target.value})} />
          </div>
          <div className="mb-3 text-start">
            <label className="fw-bold">Review Comment:</label>
            <textarea className="form-control" required onChange={(e) => setFormData({...formData, comment: e.target.value})}></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-100">Add Review</button>
        </form>
      </div>
    </div>
  );
};

export default AddReview;