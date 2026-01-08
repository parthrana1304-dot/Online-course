import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { API } from "../api/config";
import "../styles/auth.css";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= EMAIL SIGNUP ================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(API.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      setSuccess("Account created successfully! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  /* ================= GOOGLE SIGNUP / LOGIN ================= */
  const handleGoogleSuccess = async (res) => {
    try {
      // ✅ Decode Google ID token
      const googleUser = jwtDecode(res.credential);

      // ✅ Send token to backend
      const response = await fetch(API.GOOGLE_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError("Google authentication failed");
        return;
      }

      // ✅ Save tokens
      login(data.access, data.refresh);

      // ✅ Save email for welcome message
      localStorage.setItem("user_email", googleUser.email);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Google signup failed");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>Create Account 🚀</h1>
        <p>
          Join us today and get access to premium content, subscriptions and
          exclusive features.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSignup}>
          <h2>Sign Up</h2>
          <p className="auth-subtitle">Create your account</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="input-group">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="icon">🔐</span>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Create Account
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>

          {/* ===== GOOGLE SIGNUP ===== */}
          <div className="social-login">
            <p>Or sign up with</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
