import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/coursecatalog.css";
import { API } from "../api/config";

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
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

        // Categories
        const catRes = await axios.get(API.CATEGORIES);
        const categoryData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.results || [];
        setCategories(categoryData);

        // Courses
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

        // Enrolled courses
        if (token) {
          const enrolledRes = await axios.get(API.ENROLL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          let enrolledIds = [];
          if (enrolledRes.data) {
            if (Array.isArray(enrolledRes.data)) {
              enrolledIds = enrolledRes.data.map((c) => c.course?.id).filter(Boolean);
            } else if (Array.isArray(enrolledRes.data.results)) {
              enrolledIds = enrolledRes.data.results
                .map((c) => c.course?.id)
                .filter(Boolean);
            }
          }
          setEnrolledCourseIds(enrolledIds);
        }

        // Wishlist
        if (token) {
          const wlRes = await axios.get(API.WISHLIST_LIST, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const wlIds = Array.isArray(wlRes.data)
            ? wlRes.data.map((c) => c.course.id)
            : Array.isArray(wlRes.data.results)
            ? wlRes.data.results.map((c) => c.course.id)
            : [];
          setWishlistIds(wlIds);
        }
      } catch (err) {
        console.error("Fetch error:", err);
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
     TOGGLE WISHLIST
  ========================== */
  const toggleWishlist = async (courseId) => {
    if (!token) {
      alert("Please log in to add to wishlist");
      return;
    }
    try {
      await axios.post(
        API.WISHLIST_TOGGLE(courseId),
        { course: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlistIds((prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId]
      );
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      alert("Failed to update wishlist");
    }
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

  if (loading) return <p className="loading">Loading courses...</p>;
  if (!courses.length) return <p className="loading">No courses available.</p>;

  return (
    <div className="catalog-container">
      <h2>Course Catalog</h2>

      {/* FILTERS */}
      <div className="filters">
        {/* ... filter selects/input same as before ... */}
      </div>

      {/* COURSE GRID */}
      <div className="course-grid">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.includes(course.id);
          const isWishlisted = wishlistIds.includes(course.id);

          return (
            <div
              key={course.id}
              className={`course-card ${isEnrolled ? "enrolled" : ""}`}
              onClick={() => navigate(`/course/${course.id}/`)}
            >
              <div className="thumbnail-wrapper">
                <img src={course.thumbnail || "/placeholder.png"} alt={course.title} />
                {course.preview && <span className="preview-badge">Free Preview</span>}

                {/* Heart Wishlist Button */}
                <button
                  className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click navigation
                    toggleWishlist(course.id);
                  }}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  ❤️
                </button>
              </div>

              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="category">{course.category || "N/A"}</p>
                <p className="level">{course.level || "N/A"}</p>
                <p className="price">₹{course.price || 0}</p>
                <p className="rating">
                  {Array.from({ length: course.rating || 0 }, (_, i) => "⭐").join("")}
                </p>
              </div>

              {isEnrolled && <span className="enrolled-badge">Enrolled ✅</span>}
            </div>
          );
        })}
      </div>

      {!filteredCourses.length && <p className="loading">No courses match your filters.</p>}
    </div>
  );
};

export default CourseCatalog;
