import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { API } from "../api/config";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid email or password");
        return;
      }

      localStorage.setItem("access", data.access || data.token);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user_email", email);

      navigate("/");
    } catch {
      setError("Server error. Try again later.");
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (res) => {
    try {
      const googleUser = jwtDecode(res.credential);

      const response = await fetch(API.GOOGLE_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError("Google login failed");
        return;
      }

      login(data.access, data.refresh);
      localStorage.setItem("user_email", googleUser.email);
      navigate("/");
    } catch {
      setError("Google authentication error");
    }
  };

  const facebookLoginURL = `${API.FACEBOOK_LOGIN}/redirect/`;

  return (
    <div className="auth-wrapper">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>Welcome Back 🚀</h1>
        <p>Sign in to continue accessing your courses, subscriptions, and exclusive features.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Login</h2>
          <p className="auth-subtitle">Enter your credentials</p>

          {error && <div className="auth-error">{error}</div>}

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

          <button type="submit" className="auth-btn">
            Sign In
          </button>

          <div className="auth-footer">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </div>

          {/* SOCIAL LOGIN */}
          <div className="social-login">
            <p>Or sign in with</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
            />

            <a href={facebookLoginURL} className="facebook-btn">
              Continue with Facebook
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
