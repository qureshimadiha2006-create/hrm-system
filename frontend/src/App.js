import React, { useState } from "react";
import Department from "./Department";
import Employee from "./Employee";

function App() {
  const [page, setPage] = useState("department");

  return (
    <div>
      {/* HEADER */}
      <div style={{
        backgroundColor: "#282c34",
        padding: "15px",
        color: "white",
        textAlign: "center"
      }}>
        <h1>HRM System</h1>
      </div>

      {/* NAVIGATION */}
      <div style={{ textAlign: "center", margin: "20px" }}>
        <button
          style={{ margin: "10px", padding: "10px 20px" }}
          onClick={() => setPage("department")}
        >
          Department
        </button>

        <button
          style={{ margin: "10px", padding: "10px 20px" }}
          onClick={() => setPage("employee")}
        >
          Employee
        </button>
      </div>

      {/* CONTENT */}
      <div>
        {page === "department" && <Department />}
        {page === "employee" && <Employee />}
      </div>
    </div>
  );
}

export default App;