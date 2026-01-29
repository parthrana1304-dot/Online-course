import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
import Examination from "./pages/Examination";
import ExamFailed from "./pages/Examfail";
import ExaminationSuccess from "./pages/ExaminationSuccess";

// Helper: check if user is logged in
const isLoggedIn = () => !!localStorage.getItem("access"); // JWT token or auth key

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>

      {/* Pages WITH Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:id" element={<CategoryDetails />} />
        <Route path="/course" element={<Courses />} />
        
        {/* Course Details - trial lessons open, full lessons protected inside component */}
        <Route path="/course/:courseId" element={<CourseDetails />} />

        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />

        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add" element={
          <ProtectedRoute>
            <AdBanner />
          </ProtectedRoute>
        } />

        <Route path="/examination/:courseId" element={
          <ProtectedRoute>
            <Examination />
          </ProtectedRoute>
        } />
      </Route>

      {/* Pages WITHOUT Navbar & Footer */}
      <Route path="/login" element={isLoggedIn() ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isLoggedIn() ? <Navigate to="/" /> : <Signup />} />
      <Route path="/google-login" element={<GoogleLoginButton />} />
      <Route path="/course/:courseId/success" element={
        <ProtectedRoute>
          <ExaminationSuccess />
        </ProtectedRoute>
      } />
      <Route path="/course/:courseId/failed" element={
        <ProtectedRoute>
          <ExamFailed />
        </ProtectedRoute>
      } />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
