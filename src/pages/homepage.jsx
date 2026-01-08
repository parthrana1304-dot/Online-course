import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import { API } from "../api/config";
import AdBanner from "../components/adBanner";

const carouselImages = [
  "https://img.freepik.com/free-vector/e-learning-banner_33099-1724.jpg",
  "https://img.freepik.com/free-vector/online-courses-concept_23-2148532770.jpg",
  "https://img.freepik.com/free-photo/online-courses-concept_23-2148532796.jpg",
];

const HomePage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  /* ================= GET USER EMAIL ================= */
  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email && email !== "undefined" && email !== "null") {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const email = localStorage.getItem("user_email");
      setUserEmail(email && email !== "undefined" ? email : null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* ================= CAROUSEL ================= */
  useEffect(() => {
    const interval = setInterval(
      () => setSlide((s) => (s + 1) % carouselImages.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  /* ================= SAFE FETCH ================= */
  const safeFetch = async (url) => {
    const token = localStorage.getItem("access");

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return res.json();
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const catData = await safeFetch(API.CATEGORIES);
        setCategories(catData.results || []);

        let allCourses = [];
        let url = API.COURSES;

        while (url) {
          const data = await safeFetch(url);
          allCourses = [...allCourses, ...(data.results || [])];
          url = data.next;
        }

        setCourses(allCourses);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  }

  return (
    <div className="homepage">

      {/* ================= WELCOME MESSAGE ================= */}
      {userEmail && (
        <div className="welcome-msg">
          <h3>Welcome, {userEmail} 👋</h3>
        </div>
      )}

      {/* ================= CAROUSEL ================= */}
      <div className="carousel-container">
        <button className="carousel-btn left" onClick={() => setSlide(slide === 0 ? carouselImages.length - 1 : slide - 1)}>
          ❮
        </button>
        <img src={carouselImages[slide]} alt="banner" className="carousel-img" />
        <button className="carousel-btn right" onClick={() => setSlide((slide + 1) % carouselImages.length)}>
          ❯
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <section className="categories">
        <h2>Top Categories</h2>
        <div className="categories-grid">
          {categories.slice(0, 3).map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="popular-courses">
        <h2>All Courses</h2>
        <div className="courses-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <img
                src={course.thumbnail || "https://via.placeholder.com/150"}
                alt={course.title}
                className="course-thumb"
              />
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.short_description}</p>
                <p className="price">₹{course.price || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdBanner position="homepage" />
    </div>
  );
};

export default HomePage;
