import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/category.css";

const API_BASE = "http://127.0.0.1:8000/api";

const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300x200?text=No+Image";
  if (path.startsWith("http")) return path;
  return `http://127.0.0.1:8000${path}`;
};

const CategoryPage = () => {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses/category/${id}/`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="category-page">
      <h2>Courses in this Category</h2>

      {courses.length === 0 ? (
        <p>No courses found in this category.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <img
                src={getImageUrl(course.thumbnail)}
                className="category-img"
                alt={course.title}
              />

              <div className="course-info">
                <h3>{course.title}</h3>

                {/* Short description */}
                {course.short_description && (
                  <p className="short-description">{course.short_description}</p>
                )}

                {/* Price */}
                <p className="course-price">
                  Price: ₹{course.price !== undefined ? course.price : "Free"}
                </p>

                {/* Level */}
                <p className="course-level">
                  Level: {course.level || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
