import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const MainLayout = () => {
  return (
    <>
      <Navbar>
      </Navbar>
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
