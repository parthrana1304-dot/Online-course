import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ThemeToggle from "../components/themetoggle";

const MainLayout = () => {
  return (
    <>
      <Navbar>
        {/* Place toggle in navbar */}
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </Navbar>
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
