import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <select
      className="theme-select"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
};

export default ThemeToggle;
