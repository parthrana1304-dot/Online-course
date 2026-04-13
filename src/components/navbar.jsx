import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Navbar = () => {
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const [userEmail, setUserEmail] = useState(null);

  /* ================= CATEGORY ================= */
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  /* ================= REFS ================= */
  const categoryRef = useRef(null);
  const searchRef = useRef(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const email = localStorage.getItem("user_email");
    setUserEmail(
      email && email !== "undefined" && email !== "null" ? email : null
    );
  }, []);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    fetch(`${API_BASE}/categories/`)
      .then((res) => res.json())
      .then((data) =>
        setCategories(Array.isArray(data) ? data : data.results || [])
      )
      .catch(console.error);
  }, []);

  /* ================= CLOSE DROPDOWNS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target))
        setCatOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.length < 2) {
      setResults([]);
      setShowSearch(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/search/?q=${value}`);
      const data = await res.json();

      const merged = [
        ...(data.categories || []).map((i) => ({ ...i, type: "category" })),
        ...(data.courses || []).map((i) => ({ ...i, type: "course" })),
      ];

      setResults(merged);
      setShowSearch(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (item) => {
    setSearch("");
    setShowSearch(false);

    if (item.type === "course") {
      navigate(`/course/${item.id}`);
    } else {
      navigate(`/category/${item.id}`);
    }
  };


  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="logo">
          EduSite
        </Link>

        {/* SEARCH */}
        <div className="nav-search" ref={searchRef}>
          <input
            type="text"
            placeholder="Search courses or categories..."
            value={search}
            onChange={handleSearch}
            onFocus={() => setShowSearch(true)}
          />
          {showSearch && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="search-item"
                  onClick={() => handleSelect(item)}
                >
                  <span className="badge">{item.type}</span>
                  {item.title || item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NAV MENU */}
        <ul className="nav-menu">
          {/* CATEGORIES */}
          <li className="nav-item" ref={categoryRef}>
            <span className="nav-link" onClick={() => setCatOpen(!catOpen)}>
              Explore ▾
            </span>
            {catOpen && (
              <div className="category-dropdown scrollable">
                {categories.length === 0 && (
                  <div className="dropdown-item">No categories</div>
                )}
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="dropdown-item"
                    onClick={() => {
                      setCatOpen(false);
                      navigate(`/category/${cat.id}`);
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </li>

          {/* COURSES */}
          <li className="nav-item">
            <Link to="/course" className="nav-link">
              Courses
            </Link>
          </li>

          {/* WISHLIST */}
          <li className="nav-item">
            <Link to="/wishlist" className="nav-link">
              Wishlist ❤️
            </Link>
          </li>

          {/* SUBSCRIPTION */}
          <li className="nav-item">
            <Link to="/subscription" className="nav-link">
              Subscription
            </Link>
          </li>

          {/* LOGIN / ACCOUNT */}
          {userEmail ? (
            <li className="nav-item account">
              <span
                className="nav-link"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/user/profile")}
              >
                👤 {userEmail}
              </span>
              {/* Optional: Logout inside profile page only */}
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
