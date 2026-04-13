import { useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { API } from "../api/config";

const useWishlist = (initialIds = []) => {
  const [wishlistIds, setWishlistIds] = useState(initialIds);
  const token = localStorage.getItem("access");

  const toggleWishlist = async (id) => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(
        API.WISHLIST_TOGGLE(id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlistIds((prev) =>
        prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id]
      );
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  return { wishlistIds, setWishlistIds, toggleWishlist };
};

const CourseCard = ({ course, wishlistIds, toggleWishlist, navigate }) => {
  const wishlisted = wishlistIds.includes(course.id);

  // Inline styles for internal CSS
const styles = {
  card: {
    position: "relative",
    width: "250px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    margin: "10px",
    background: "#fff",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHover: {
    transform: "scale(1.03)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
  },
  wishlistButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(255,255,255,0.9)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "20px",
    zIndex: 10,
    transition: "transform 0.2s",
  },
  wishlistButtonHover: {
    transform: "scale(1.2)",
  },
  imageBox: {
    width: "100%",
    height: "150px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  title: {
    padding: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
  },
};


  return (
    <div
      key={course.id}
      style={styles.card}
      onClick={() => navigate(`/course/${course.id}/`)}
    >
      <button
        style={styles.wishlistButton}
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(course.id);
        }}
      >
        {wishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div style={styles.imageBox}>
        <img
          src={course.thumbnail || "/placeholder.png"}
          alt={course.title}
          style={styles.image}
        />
      </div>

      <div style={styles.title}>{course.title}</div>
    </div>
  );
};

export { useWishlist, CourseCard };
