import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/config";
import "../styles/wishlist.css";

// Reusable Login Prompt
const LoginPrompt = ({ message, onClose }) => {
  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-box">
        <p>{message || "Please log in first to continue."}</p>
        <button
          className="login-btn"
          onClick={() => {
            onClose();
            window.location.href = "/login";
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      setShowLoginPrompt(true);
    } else {
      loadWishlist();
    }
  }, [token]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.WISHLIST_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data.results)) list = data.results;
      else if (Array.isArray(data.wishlist)) list = data.wishlist;
      setWishlist(list);
    } catch (err) {
      console.error("Wishlist load error", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId) => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const res = await fetch(API.WISHLIST_TOGGLE(courseId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId }),
      });

      if (!res.ok) throw new Error("Failed to remove from wishlist");

      setWishlist((prev) =>
        prev.filter((item) => item.course.id !== courseId)
      );
    } catch (err) {
      console.error("Remove wishlist error", err);
      alert("Failed to remove from wishlist. Please try again.");
    }
  };

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <h1>❤️ My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p>No courses in your wishlist.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const imgUrl = item.course.thumbnail.startsWith("http")
              ? item.course.thumbnail
              : `http://127.0.0.1:8000${item.course.thumbnail}`;

            return (
              <div className="wishlist-card" key={item.id}>
                <img src={imgUrl} alt={item.course.title} />
                <h3>{item.course.title}</h3>
                <p>{item.course.short_description}</p>

                <div className="wishlist-actions">
                  <Link to={`/course/${item.course.id}`} className="view-btn">
                    View
                  </Link>

                  {/* Trash Icon Button */}
                  <button
                    className="remove-icon-btn"
                    onClick={() => removeFromWishlist(item.course.id)}
                    title="Remove from wishlist"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showLoginPrompt && (
        <LoginPrompt
          message="Please log in to access your wishlist."
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default Wishlist;
