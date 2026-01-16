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

  const [loginType, setLoginType] = useState("password"); // password | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(0); // 0: not recovering, 1: enter email, 2: done

  /* ================= EMAIL + PASSWORD LOGIN ================= */
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

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user_email", email);
      navigate("/");
    } catch {
      setError("Server error. Try again later.");
    }
  };

  /* ================= OTP LOGIN ================= */
  const sendOtp = async () => {
    setError("");
    try {
      await fetch(API.SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: email }),
      });
      setStep(2);
    } catch {
      setError("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    setError("");
    try {
      const res = await fetch(API.VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      login(data.access, data.refresh);
      localStorage.setItem("user_email", email);
      navigate("/");
    } catch {
      setError("OTP verification failed");
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

  /* ================= PASSWORD RECOVERY ================= */
  const sendRecoveryEmail = async () => {
    setError("");
    try {
      const res = await fetch(API.SEND_RECOVERY_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to send recovery email");
        return;
      }

      setRecoveryStep(2); // success message
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>Welcome Back 🚀</h1>
        <p>Login using password, OTP, or Google</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Login</h2>

          {error && <div className="auth-error">{error}</div>}

          {recoveryStep === 0 && (
            <>
              {/* LOGIN TYPE SWITCH */}
              <div className="login-tabs">
                <button
                  className={loginType === "password" ? "active" : ""}
                  onClick={() => {
                    setLoginType("password");
                    setStep(1);
                  }}
                >
                  Password
                </button>
                <button
                  className={loginType === "otp" ? "active" : ""}
                  onClick={() => {
                    setLoginType("otp");
                    setStep(1);
                  }}
                >
                  OTP
                </button>
              </div>

              {/* PASSWORD LOGIN */}
              {loginType === "password" && (
                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button className="auth-btn">Sign In</button>

                  <div className="forgot-password">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              )}

              {/* OTP LOGIN */}
              {loginType === "otp" && (
                <>
                  {step === 1 && (
                    <>
                      <div className="input-group">
                        <input
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <button className="auth-btn" onClick={sendOtp}>
                        Send OTP
                      </button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="input-group">
                        <input
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <button className="auth-btn" onClick={verifyOtp}>
                        Verify OTP
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* PASSWORD RECOVERY FORM */}
          {recoveryStep === 1 && (
            <>
              <h3>Recover Password</h3>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="auth-btn" onClick={sendRecoveryEmail}>
                Send Recovery Email
              </button>
              <button
                className="auth-btn secondary"
                onClick={() => setRecoveryStep(0)}
              >
                Back to Login
              </button>
            </>
          )}

          {recoveryStep === 2 && (
            <>
              <p>
                ✅ Recovery email sent! Please check your inbox to reset your
                password.
              </p>
              <button
                className="auth-btn secondary"
                onClick={() => setRecoveryStep(0)}
              >
                Back to Login
              </button>
            </>
          )}

          <div className="auth-footer">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="social-login">
            <p>Or continue with</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
