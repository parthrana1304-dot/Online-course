import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/homepage";
import CourseDetails from "./pages/coursedetails";
import Wishlist from "./pages/wishlist";
import CategoryDetails from "./pages/categorydetails";
import Courses from "./pages/courses";
import Signup from "./pages/signup";
import Login from "./pages/login";
import MainLayout from "./layouts/MainLayout";
import Subscription from "./pages/Subscription";
import AboutPage from "./pages/AboutPage";
import Contact from "./pages/contact";
import AdBanner from "./components/adBanner";
import GoogleLoginButton from "./components/googleloginbtn";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
     <Routes>

        {/* Pages WITH Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />}  />
          <Route path="/category/:id" element={<CategoryDetails />} />
          <Route path="/course" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/add" element={<AdBanner />} />
        </Route>

        {/* Pages WITHOUT Navbar & Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/google-login" element={<GoogleLoginButton />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
