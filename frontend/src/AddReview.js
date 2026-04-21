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

  // Base URL defined once to avoid typos
  const BASE_URL = "https://hrm-system-madiha.onrender.com";

  useEffect(() => {
    // Fetches employees to populate the dropdown
    axios.get(`${BASE_URL}/employees`)
      .then(res => setEmployees(res.data))
      .catch(err => console.error("Error fetching employees:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // LOGIC CHANGE: Ensure numerical values are sent as Numbers, not Strings
    // Also ensuring key names match the backend database columns
    const payload = {
      emp_id: parseInt(formData.emp_id),
      rating: parseInt(formData.rating),
      review_comment: formData.comment, // Changed 'comment' to 'review_comment' for backend sync
      review_date: formData.review_date,
      review_period: formData.review_period,
      review_title: formData.review_title
    };

    axios.post(`${BASE_URL}/add-review`, payload)
      .then(() => {
        alert("✅ Review Added Successfully!");
        if (goBack) goBack();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Error adding review. Please check if the Backend is live and Employee ID is valid.");
      });
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-4 bg-dark text-white border-light">
        <h3 className="mb-4">Add Review</h3>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-3 text-start">
            <label className="fw-bold">Review Title:</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              onChange={(e) => setFormData({...formData, review_title: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Select Employee:</label>
            <select 
              className="form-select" 
              required 
              value={formData.emp_id}
              onChange={(e) => setFormData({...formData, emp_id: e.target.value})}
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                // Logic: Show Name, but use ID as the underlying value
                <option key={emp.emp_id} value={emp.emp_id}>
                  {emp.emp_name} (ID: {emp.emp_id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Review Date:</label>
            <input 
              type="date" 
              className="form-control" 
              required 
              onChange={(e) => setFormData({...formData, review_date: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Review Period:</label>
            <select 
              className="form-select" 
              value={formData.review_period}
              onChange={(e) => setFormData({...formData, review_period: e.target.value})}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Enter Rating (1-10):</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              className="form-control" 
              required 
              onChange={(e) => setFormData({...formData, rating: e.target.value})} 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="fw-bold">Review Comment:</label>
            <textarea 
              className="form-control" 
              required 
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary w-100">Add Review</button>
          {goBack && (
            <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={goBack}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddReview;