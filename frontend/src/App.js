import React, { useState } from "react";
import Department from "./Department";
import Employee from "./Employee";
import Role from "./Role";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import CreateTask from "./CreateTask"; 
import TaskDashboard from "./TaskDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("login");

  // --- LOGIN FLOW ---
  if (!isLoggedIn) {
    if (page === "forgot") {
      return <ForgotPassword goBack={() => setPage("login")} />;
    }

    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          setPage("task-dashboard"); // Redirect to dashboard immediately after login
        }}
        goToForgot={() => setPage("forgot")}
      />
    );
  }

  // --- MAIN APP (LOGGED IN) ---
  return (
    <div className="container-fluid p-0">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-3 shadow">
        <span className="navbar-brand fw-bold">HRM System</span>
        <div className="navbar-nav ms-auto">
          <button className={`btn btn-sm mx-1 ${page === "department" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("department")}>Department</button>
          <button className={`btn btn-sm mx-1 ${page === "employee" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("employee")}>Employee</button>
          <button className={`btn btn-sm mx-1 ${page === "role" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("role")}>Role</button>
          <button className={`btn btn-sm mx-1 ${page === "create-task" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("create-task")}>Create Task</button>
          <button className={`btn btn-sm mx-1 ${page === "task-dashboard" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("task-dashboard")}>Task Dashboard</button>
         <button className={`btn btn-sm mx-1 ${page === "add-review" ? "btn-light" : "btn-outline-light"}`} onClick={() => setPage("add-review")}>Add Review</button>
          <button
            className="btn btn-sm btn-danger ms-3"
            onClick={() => {
              setIsLoggedIn(false);
              setPage("login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container text-center">
        {page === "department" && <Department />}
        {page === "employee" && <Employee />}
        {page === "role" && <Role />}
        
        {/* Pass goBack prop to CreateTask to satisfy its requirements */}
        {page === "create-task" && (
          <CreateTask goBack={() => setPage("task-dashboard")} />
        )}
        
        {page === "task-dashboard" && <TaskDashboard />}
        {page === "add-review" && <AddReview goBack={() => setPage("task-dashboard")} />}
      </div>
    </div>
  );
}

export default App;