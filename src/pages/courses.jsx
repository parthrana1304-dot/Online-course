import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/coursecatalog.css";
import { API } from "../api/config";

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState({
    category: "",
    level: "",
    price: "",
    rating: "",
    sort: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const getCategoryId = (category) => {
    if (!category) return null;
    if (typeof category === "object") return category.id;
    if (typeof category === "number") return category;
    if (!isNaN(category)) return Number(category);
    return null;
  };

  /* =========================
     FETCH DATA
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await axios.get(API.CATEGORIES);
        const categoryData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.results || [];
        setCategories(categoryData);

        // Fetch courses (paginated)
        let allCourses = [];
        let url = API.COURSES;
        while (url) {
          const res = await axios.get(url);
          const data = Array.isArray(res.data)
            ? res.data
            : res.data?.results || [];
          allCourses = [...allCourses, ...data];
          url = res.data?.next;
        }
        setCourses(allCourses);

        // Extract unique instructors
        const uniqueInstructors = Array.from(
          new Set(allCourses.map((c) => c.instructor?.username).filter(Boolean))
        );
        setInstructors(uniqueInstructors);

        // Fetch enrolled courses
        if (token) {
          const enrolledRes = await axios.get(API.ENROLL, {
            headers: { Authorization: `Bearer ${token}` },
          });

          let enrolledIds = [];
          if (enrolledRes.data) {
            if (Array.isArray(enrolledRes.data)) {
              enrolledIds = enrolledRes.data.map((c) => c.course?.id).filter(Boolean);
            } else if (Array.isArray(enrolledRes.data.results)) {
              enrolledIds = enrolledRes.data.results.map((c) => c.course?.id).filter(Boolean);
            }
          }
          setEnrolledCourseIds(enrolledIds);
        } else {
          setEnrolledCourseIds([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourses([]);
        setCategories([]);
        setEnrolledCourseIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  /* =========================
     FILTER HANDLER
  ========================== */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  /* =========================
     FILTER + SORT COURSES
  ========================== */
  const filteredCourses = courses
    .filter((course) => {
      return (
        (!filter.category ||
          getCategoryId(course.category) === Number(filter.category)) &&
        (!filter.level ||
          (course.level || "").toLowerCase().includes(filter.level.toLowerCase())) &&
        (!filter.price || (course.price || 0) <= Number(filter.price)) &&
        (!filter.rating || (course.rating || 0) >= Number(filter.rating))
      );
    })
    .sort((a, b) => {
      if (filter.sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (filter.sort === "price_desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  /* =========================
     RENDER
  ========================== */
  if (loading) return <p className="loading">Loading courses...</p>;
  if (!courses.length) return <p className="loading">No courses available.</p>;

  return (
    <div className="catalog-container">
      <h2>Course Catalog</h2>

      {/* FILTERS */}
      <div className="filters">
        <select
          name="category"
          value={filter.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select name="level" value={filter.level} onChange={handleFilterChange}>
          <option value="">Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <input
          name="price"
          type="number"
          placeholder="Max price"
          value={filter.price}
          onChange={handleFilterChange}
        />

        <select name="rating" value={filter.rating} onChange={handleFilterChange}>
          <option value="">Min rating</option>
          <option value="1">1⭐</option>
          <option value="2">2⭐</option>
          <option value="3">3⭐</option>
          <option value="4">4⭐</option>
          <option value="5">5⭐</option>
        </select>

        <select name="sort" value={filter.sort} onChange={handleFilterChange}>
          <option value="">Sort By</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
        </select>
      </div>

      {/* COURSE GRID */}
      <div className="course-grid">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className={`course-card ${isEnrolled ? "enrolled" : ""}`}
              onClick={() => navigate(`/course/${course.id}/`)}
            >
              <div className="thumbnail-wrapper">
                <img src={course.thumbnail || "/placeholder.png"} alt={course.title} />
                {course.preview && <span className="preview-badge">Free Preview</span>}
              </div>

              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="category">{course.category || "N/A"}</p>
                <p className="level">{course.level || "N/A"}</p>
                <p className="price">₹{course.price || 0}</p>
                <p className="rating">
                  {Array.from({ length: course.rating || 0 }, (_, i) => "⭐").join("")}
                </p>

                {/* Short Description */}
                {course.short_description && (
                  <p className="short-description">{course.short_description}</p>
                )}

                {/* Admin Tags */}
                {Array.isArray(course.tags) && course.tags.length > 0 && (
                  <div className="tags">
                    {course.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="tag"
                        style={{ backgroundColor: tag.color || "#e74c3c" }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {isEnrolled && <span className="enrolled-badge">Enrolled ✅</span>}
              </div>
            </div>
          );
        })}
      </div>

      {!filteredCourses.length && <p className="loading">No courses match your filters.</p>}
    </div>
  );
};

export default CourseCatalog;
