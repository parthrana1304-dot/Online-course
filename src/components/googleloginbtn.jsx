import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        return;
      }

      // ✅ STORE CORRECT KEYS
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      navigate("/");
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google Error")} />;
};

export default GoogleLoginButton;
