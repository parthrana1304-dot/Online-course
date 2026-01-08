import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/courseDetails.css";
import { API } from "../api/config";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [avgRating, setAvgRating] = useState(0);

  /* ================= LOAD COURSE ================= */
  const loadCourse = useCallback(async () => {
    try {
      const res = await fetch(API.COURSE_BY_ID(courseId));
      const data = await res.json();
      setCourse(data);

      if (data.trial_video) setCurrentVideo(data.trial_video);
      else if (data.lessons?.[0]?.video_url) setCurrentVideo(data.lessons[0].video_url);
    } catch (err) {
      console.error("Course load failed", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  /* ================= ENROLL CHECK ================= */
  const checkEnrollment = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(API.ENROLL_CHECK(courseId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsEnrolled(data.enrolled);
    } catch (err) {
      console.error("Enroll check failed", err);
    }
  }, [courseId, token]);

  /* ================= RAZORPAY SCRIPT LOADER ================= */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /* ================= ENROLL ================= */
  const handleEnroll = async () => {
    if (!token) return navigate("/login");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) return alert("Razorpay SDK failed to load. Check your internet.");

      // Create order on backend
      const res = await fetch(API.CREATE_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId, amount: finalPrice || course.price }),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const { order_id, amount, currency, razorpay_key } = await res.json();

      const options = {
        key: razorpay_key || "rzp_test_0yCaQoC8hI6DCW",
        amount,
        currency,
        name: course.title,
        description: "Course Enrollment",
        order_id,
        handler: async function (response) {
          const verifyRes = await fetch(API.VERIFY_PAYMENT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              course: courseId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) throw new Error("Payment verification failed");

          alert("🎉 Payment successful & enrollment completed!");
          setIsEnrolled(true);
          await loadCourse();
          await checkEnrollment();
        },
        prefill: { email: localStorage.getItem("user_email") || "user@example.com" },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Payment failed. Please try again.");
    }
  };

  /* ================= WISHLIST ================= */
  const loadWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(API.WISHLIST_CHECK(courseId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInWishlist(data.in_wishlist);
    } catch (err) {
      console.error(err);
    }
  }, [courseId, token]);

  const toggleWishlist = async () => {
    if (!token) return navigate("/login");
    await fetch(API.WISHLIST_TOGGLE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course: courseId }),
    });
    setInWishlist(!inWishlist);
  };

  /* ================= REVIEWS ================= */
  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(API.COURSE_REVIEWS(courseId));
      const data = await res.json();
      setReviews(data || []);
      if (data?.length) {
        const total = data.reduce((s, r) => s + r.rating, 0);
        setAvgRating((total / data.length).toFixed(1));
      }
    } catch (err) {
      console.error(err);
    }
  }, [courseId]);

  const submitReview = async () => {
    if (!token) return navigate("/login");
    if (!isEnrolled) return alert("Enroll to leave a review");
    if (!rating) return alert("Select rating");

    await fetch(API.COURSE_REVIEWS(courseId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, comment }),
    });

    setRating(0);
    setComment("");
    loadReviews();
  };

  /* ================= COUPON ================= */
  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const res = await fetch(API.APPLY_VALID_COUPON, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (!data.valid) {
        setCouponError(data.message || "Invalid coupon");
        setAppliedCoupon(null);
        setFinalPrice(course.price);
        return;
      }

      const coupon = data.coupon;
      let discountedPrice = course.price;

      if (coupon.discount_type === "percentage") {
        discountedPrice -= (discountedPrice * coupon.discount_value) / 100;
      } else if (coupon.discount_type === "flat") {
        discountedPrice -= coupon.discount_value;
      }

      setAppliedCoupon(coupon);
      setFinalPrice(Math.max(0, discountedPrice));
      setCouponError("");
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon");
    }
  };

  useEffect(() => {
    if (course?.price) setFinalPrice(course.price);
  }, [course]);

  /* ================= PLAY LESSON ================= */
  const playLesson = (lesson) => {
    if (!isEnrolled) {
      alert("🔒 Please enroll to watch this video");
      return;
    }
    if (!lesson.video_url) {
      alert("❌ Video not available");
      return;
    }
    setCurrentVideo(lesson.video_url);
  };

  const goToSubscription = () => {
    if (!token) navigate("/login");
    else navigate("/subscription");
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    loadCourse();
    loadReviews();
  }, [loadCourse, loadReviews]);

  useEffect(() => {
    if (course) {
      checkEnrollment();
      loadWishlist();
    }
  }, [course, checkEnrollment, loadWishlist]);

  if (loading) return <p>Loading...</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <div className="course-layout">
      <div className="course-main">
        {/* Instructor */}
        {course.instructor && (
          <section className="instructor-section">
            <h2>Instructor</h2>
            <div className="instructor-card">
              <img
                src={course.instructor.profile_picture || "/assets/default.png"}
                alt={course.instructor.username || "Instructor"}
                className="instructor-img"
              />
              <div className="instructor-info">
                <strong>{course.instructor.username || "Instructor"}</strong>
                <p>{course.instructor.bio || "No bio available."}</p>
                <div className="instructor-socials">
                  {course.instructor.socials?.map((s, i) => (
                    <a key={i} href={s.link} target="_blank" rel="noopener noreferrer">
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <h1>{course.title}</h1>
        <p>{course.short_description}</p>
        <h3>
          ₹{finalPrice} {appliedCoupon && <span className="old-price">₹{course.price}</span>}
        </h3>
        <div className="course-meta-bar">
          ⭐ {avgRating || "No ratings"} | 📚 {course.lessons?.length || 0} Lessons
        </div>

        {/* Lessons */}
        <section className="lesson-section">
          <h2>Lessons</h2>
          {course.lessons?.map((lesson) => (
            <div
              key={lesson.id}
              className={`lesson-row ${!isEnrolled ? "locked" : ""}`}
              onClick={isEnrolled ? () => playLesson(lesson) : undefined}
            >
              <img
                src={lesson.thumbnail || "https://via.placeholder.com/120x80?text=Lesson"}
                alt={lesson.title}
                className="lesson-thumb"
              />
              <div className="lesson-content">
                <strong>{lesson.title}</strong>
                {lesson.short_description && <p>{lesson.short_description}</p>}
              </div>
              {!isEnrolled && <span className="lock-icon">🔒</span>}
            </div>
          ))}
        </section>

        {/* Reviews */}
        <section className="reviews-section">
          <h2>Student Reviews</h2>
          {reviews.length === 0 && <p>No reviews yet. Be the first!</p>}
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.user || "Student"}</strong>
                <span className="review-stars">{"⭐".repeat(review.rating)}</span>
              </div>
              {review.comment && <p>{review.comment}</p>}
            </div>
          ))}
          {isEnrolled && (
            <div className="review-form">
              <h3>Leave a Review</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n <= rating ? "star active" : "star"}
                    onClick={() => setRating(n)}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button onClick={submitReview}>Submit Review</button>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="course-sidebar">
        <div className="sticky-card">
          {currentVideo && (
            <video key={currentVideo} width="100%" controls>
              <source src={currentVideo} type="video/mp4" />
            </video>
          )}

          <button
            className={`wishlist-btn ${inWishlist ? "active" : ""}`}
            onClick={toggleWishlist}
          >
            {inWishlist ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
          </button>

          {!isEnrolled ? (
            <>
              <button className="enroll-btn" onClick={handleEnroll}>
                🎓 Buy This Course
              </button>

              <button className="subscription-btn" onClick={goToSubscription}>
                ⭐ Buy Subscription (Unlimited Access)
              </button>
            </>
          ) : (
            <button className="enroll-btn enrolled">✅ You are Enrolled</button>
          )}

          {!isEnrolled && (
            <div className="coupon-box">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={applyCoupon}>Apply</button>

              {couponError && <p className="coupon-error">{couponError}</p>}
              {appliedCoupon && (
                <p className="coupon-success">
                  Coupon <b>{appliedCoupon.code}</b> applied 🎉
                </p>
              )}
            </div>
          )}

          <h3>What you'll get</h3>
          <ul className="course-benefits">
            <li>✔ Lifetime access</li>
            <li>✔ Certificate of completion</li>
            <li>✔ Full HD video content</li>
            <li>✔ Access on mobile & TV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
