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
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const token = localStorage.getItem("access");

  /* ================= USER EMAIL ================= */
  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email && email !== "undefined" && email !== "null") {
      setUserEmail(email);
    }
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

        // Load wishlist
        if (token) {
          const wl = await safeFetch(API.WISHLIST_LIST);
          const ids = Array.isArray(wl)
            ? wl.map((i) => i.course.id)
            : wl.results?.map((i) => i.course.id) || [];
          setWishlistIds(ids);
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlist = async (e, courseId) => {
    e.stopPropagation();

    if (!token) {
      alert("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    try {
      await fetch(API.WISHLIST_TOGGLE(courseId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId }),
      });

      setWishlistIds((prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId]
      );
    } catch (err) {
      alert("Failed to update wishlist");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  }

  return (
    <div className="homepage">
      {userEmail && (
        <div className="welcome-msg">
          <h3>Welcome, {userEmail} 👋</h3>
        </div>
      )}

      {/* CAROUSEL */}
      <div className="carousel-container">
        <img src={carouselImages[slide]} alt="banner" className="carousel-img" />
      </div>

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

      {/* COURSES */}
      <section className="popular-courses">
        <h2>All Courses</h2>
        <div className="courses-grid">
          {courses.map((course) => {
            const isWishlisted = wishlistIds.includes(course.id);

            return (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="thumb-wrapper">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/150"}
                    alt={course.title}
                    className="course-thumb"
                  />

                  {/* ❤️ Wishlist Button */}
                  <button
                    className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                    onClick={(e) => toggleWishlist(e, course.id)}
                    title="Add to wishlist"
                  >
                    ❤️
                  </button>
                </div>

                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.short_description}</p>
                  <p className="price">₹{course.price || 0}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AdBanner position="homepage" />
    </div>
  );
};

export default HomePage;
