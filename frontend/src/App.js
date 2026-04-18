import React, { useState } from "react";
import Department from "./Department";
import Employee from "./Employee";
import Role from "./Role";   // ✅ ADD THIS
import Login from "./Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("department");

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>HRM System</h1>

      {/* 🔹 NAVIGATION */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setPage("department")}>
          Department
        </button>

        <button onClick={() => setPage("employee")}>
          Employee
        </button>

        {/* ✅ NEW ROLE BUTTON */}
        <button onClick={() => setPage("role")}>
          Role
        </button>

        <button onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>

      {/* 🔹 PAGE SWITCH */}
      {page === "department" && <Department />}
      {page === "employee" && <Employee />}
      {page === "role" && <Role />}   {/* ✅ ADD THIS */}
    </div>
  );
}

export default App;