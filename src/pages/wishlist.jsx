import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/config";
import "../styles/wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Load wishlist
  const loadWishlist = async () => {
    try {
      const res = await fetch(API.WISHLIST_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch wishlist");

      const data = await res.json();

      // Make sure data is array
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

  // Remove course from wishlist
  const removeFromWishlist = async (courseId) => {
    try {
      const res = await fetch(API.WISHLIST_TOGGLE, {
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
    }
  };

  useEffect(() => {
    if (token) loadWishlist();
  }, [token]);

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <h1>❤️ My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p>No courses in your wishlist.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            // Make full URL for image
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

                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.course.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
