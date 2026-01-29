import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPrompt = ({ message }) => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center",
        maxWidth: "400px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.3)"
      }}>
        <p>{message || "Please log in first to continue."}</p>
        <button 
          onClick={goToLogin} 
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
