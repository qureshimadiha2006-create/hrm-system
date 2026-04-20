import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://hrm-system-madiha.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  // SEND OTP
  const sendOTP = async () => {
    try {
      await axios.post(`${BASE_URL}/send-otp`, { email });
      alert("OTP sent to email");
      setStep(2);
    } catch {
      alert("Error sending OTP");
    }
  };

  // RESET PASSWORD
  const resetPassword = async () => {
    try {
      await axios.post(`${BASE_URL}/reset-password`, {
        email,
        otp,
        new_password: newPassword
      });

      alert("Password reset successful");
      setStep(1);
    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Forgot Password</h2>

      {step === 1 && (
        <>
          <input
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <br /><br />
          <button onClick={resetPassword}>Reset Password</button>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;