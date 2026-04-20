import React, { useState } from "react";

function Login({ onLogin, goToForgot }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // SIMPLE ADMIN LOGIN
    if (username === "admin" && password === "1234") {
      onLogin();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Admin Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <br /><br />

      {/* FORGOT PASSWORD LINK */}
      <p
  onClick={() => goToForgot && goToForgot()}
  style={{ color: "blue", cursor: "pointer" }}
>
  Forgot Password?
</p>
    </div>
  );
}

export default Login;