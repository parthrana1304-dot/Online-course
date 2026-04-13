import React, { useEffect, useState } from "react";
const WelcomeHeader = ({ title }) => {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email && email !== "undefined" && email !== "null") {
      setUserEmail(email);
    }
  }, []);

  if (!userEmail) return null;

  return (
    <div className="welcome-msg">
      <h3>Welcome, {userEmail} 👋</h3>
      {title && <h2>{title}</h2>}
    </div>
  );
};

export default WelcomeHeader;
