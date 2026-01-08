import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get saved theme or default to 'system'
  const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "system");

  // Function to apply actual theme to document
  const applyTheme = (theme) => {
    let actualTheme = theme;

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      actualTheme = prefersDark ? "dark" : "light";
    }

    document.documentElement.setAttribute("data-theme", actualTheme);
  };

  // Whenever theme changes
  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    applyTheme(theme);

    // Listen to system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
