import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { API } from "../api/config";
import { useWishlist } from "../components/wishlisted";
import WelcomeHeader from "../components/welcomeheader";
import "../styles/coursecatalog.css";

const CourseCatalog = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { wishlistIds, setWishlistIds, toggleWishlist } = useWishlist();

  const [filter, setFilter] = useState({
    category: "",
    level: "",
    price: "",
    sort: "",
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        /* Categories */
        const catRes = await axios.get(API.CATEGORIES);
        setCategories(catRes.data?.results || catRes.data || []);

        /* Courses */
        let allCourses = [];
        let url = API.COURSES;

        while (url) {
          const res = await axios.get(url);
          allCourses = [...allCourses, ...(res.data?.results || res.data)];
          url = res.data?.next;
        }
        setCourses(allCourses);

        if (token) {
          /* Enrolled */
          const enrollRes = await axios.get(API.ENROLL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEnrolledIds(
            (enrollRes.data?.results || enrollRes.data || [])
              .map((e) => e.course?.id)
              .filter(Boolean)
          );

          /* Wishlist */
          const wlRes = await axios.get(API.WISHLIST_LIST, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWishlistIds(
            (wlRes.data?.results || wlRes.data || [])
              .map((w) => w.course?.id)
              .filter(Boolean)
          );
        }
      } catch (error) {
        console.error("Catalog fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, setWishlistIds]);

  /* ================= FILTER + SORT ================= */
  const filteredCourses = courses
    .filter((c) => {
      // CATEGORY
      const categoryId = c.category?.id || c.category;
      const categoryMatch =
        !filter.category || String(categoryId) === String(filter.category);

      // LEVEL (case-insensitive, trimmed)
      const levelMatch =
        !filter.level ||
        (c.level?.toString().trim().toLowerCase() ===
          filter.level.trim().toLowerCase());

      // PRICE
      const priceMatch = !filter.price || (c.price || 0) <= Number(filter.price);

      return categoryMatch && levelMatch && priceMatch;
    })
    .sort((a, b) => {
      if (filter.sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (filter.sort === "price_desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  if (loading) return <div className="loader">Loading courses...</div>;

  return (
    <>
      <div className="course-catalog-page">
        <WelcomeHeader title="Explore Our Courses 🎓" />
      </div>

      <div className="catalog-container">
        {/* FILTERS */}
        <div className="filters">
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={filter.sort}
            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* COURSES GRID */}
        <div className="course-grid">
          {filteredCourses.map((course) => {
            const enrolled = enrolledIds.includes(course.id);
            const wishlisted = wishlistIds.includes(course.id);

            return (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/course/${course.id}/`)}
              >
                {/* Wishlist */}
                <button
                  className={`wishlist ${wishlisted ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(course.id);
                  }}
                >
                  {wishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* Image */}
                <div className="image-box">
                  <img src={course.thumbnail || "/placeholder.png"} alt={course.title} />
                </div>

                {/* Body */}
                <div className="course-body">
                  <h3>{course.title}</h3>
                  <p className="meta">
                    {course.category?.name || course.category || "General"} • {course.level || "N/A"}
                  </p>
                  <div className="rating">
                    {Array.from({ length: course.rating || 0 }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <div className="price-row">
                    <span className="price">₹{course.price || 0}</span>
                    {enrolled && <span className="badge">Enrolled</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!filteredCourses.length && <p className="empty">No courses found 😔</p>}
      </div>
    </>
  );
};

export default CourseCatalog;
