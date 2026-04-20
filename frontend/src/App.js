import React, { useState } from "react";
import Department from "./Department";
import Employee from "./Employee";
import Role from "./Role";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("login");

  // NOT LOGGED IN FLOW
  if (!isLoggedIn) {
    if (page === "forgot") {
      return <ForgotPassword goBack={() => setPage("login")} />;
    }

    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        goToForgot={() => setPage("forgot")}
      />
    );
  }

  // AFTER LOGIN
  return (
    <div style={{ textAlign: "center" }}>
      <h1>HRM System</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setPage("department")}>Department</button>
        <button onClick={() => setPage("employee")}>Employee</button>
        <button onClick={() => setPage("role")}>Role</button>
        <button
          onClick={() => {
            setIsLoggedIn(false);
            setPage("login");
          }}
        >
          Logout
        </button>
      </div>

      {page === "department" && <Department />}
      {page === "employee" && <Employee />}
      {page === "role" && <Role />}
    </div>
  );
}

export default App;