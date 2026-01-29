import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/courseDetails.css";
import axios from "axios";
import { API } from "../api/config";
import LoginPrompt from "../components/loginprompt";

const CourseDetails = () => {
  const { courseId } = useParams();
const getResumeKey = (courseId, lessonId) =>
  `resume_course_${courseId}_lesson_${lessonId}`;

  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState({ is_completed: false });
  const token = localStorage.getItem("access");
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const [resumeLessonId, setResumeLessonId] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [showResumeBtn, setShowResumeBtn] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [avgRating, setAvgRating] = useState(0);

  const videoRef = useRef();

  /* ================= LOAD COURSE ================= */
  const loadCourse = useCallback(async () => {
    try {
      const res = await fetch(API.COURSE_BY_ID(courseId));
      const text = await res.text();

      if (!res.ok || text.startsWith("<")) {
        throw new Error("Invalid JSON response");
      }

      const data = JSON.parse(text);
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

      const text = await res.text();
      if (!res.ok || text.startsWith("<")) return;

      const data = JSON.parse(text);
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
    const isLoggedIn = !!localStorage.getItem("access");

    if (!token) return navigate("/login");

    try {
       if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
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
    try {
      if (token) {
        // Logged-in user: check from backend
        const res = await fetch(API.WISHLIST_CHECK(courseId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInWishlist(data.in_wishlist);
      } else {
        // Guest user: check from localStorage
        const guestWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setInWishlist(guestWishlist.includes(courseId));
      }
    } catch (err) {
      console.error(err);
    }
  }, [courseId, token]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ✅ Add/Remove wishlist
  const toggleWishlist = async () => {
    try {
      if (!token) {
        // Guest user
        let guestWishlist =
          JSON.parse(localStorage.getItem("wishlist")) || [];

        if (guestWishlist.includes(courseId)) {
          guestWishlist = guestWishlist.filter((id) => id !== courseId);
          setInWishlist(false);
        } else {
          guestWishlist.push(courseId);
          setInWishlist(true);
        }

        localStorage.setItem("wishlist", JSON.stringify(guestWishlist));
        return;
      }

      // 🔥 LOGGED-IN USER
      const res = await fetch(API.WISHLIST_TOGGLE(courseId), {
        method: "POST", // ✅ THIS FIXES 405
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      if (!res.ok || text.startsWith("<")) {
        console.error("Wishlist toggle failed");
        return;
      }

      const data = JSON.parse(text);
      setInWishlist(data.in_wishlist);

    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  /* ================= REVIEWS ================= */
  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(API.COURSE_REVIEWS(courseId));
      const text = await res.text();

      if (!res.ok || text.startsWith("<")) return;

      const data = JSON.parse(text);
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
    if (!couponCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch(API.APPLY_VALID_COUPON, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
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
      setCouponError("Server error while applying coupon");
    }
  };

  useEffect(() => {
    if (course?.price) setFinalPrice(course.price);
  }, [course]);

  useEffect(() => {
    if (!token || !courseId) return;

    fetch(API.LAST_WATCHED_LESSON(courseId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.lesson_id) {
          setResumeLessonId(data.lesson_id);
          setResumeTime(data.last_watched_time || 0);
        }
      });
  }, [courseId]);

  useEffect(() => {
    if (!course || !resumeLessonId) return;

    const lesson = course.lessons.find(l => l.id === resumeLessonId);
    if (!lesson) return;

    setCurrentLesson(lesson);
    setCurrentVideo(lesson.video_url);

    if (resumeTime > 5 && isMobile) {
      setShowResumeBtn(true); // mobile needs tap
    }
  }, [course, resumeLessonId]);

  /* ================= PLAY LESSON ================= */
  useEffect(() => {
    if (!currentLesson?.id || !token) return;

    fetch(API.LESSON_PROGRESS(courseId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const time = data.last_watched_time || 0;
        setResumeTime(time);

        if (time > 5) {
          setShowResumeBtn(true); // 👈 show button on mobile
        }
      });
  }, [currentLesson?.id]);

  const playLesson = (lesson) => {
    if (!isEnrolled) {
      alert("Please enroll");
      return;
    }

    if (!lesson?.id || !lesson?.video_url) {
      console.error("Invalid lesson object", lesson);
      return;
    }

    setCurrentLesson(lesson);
    setCurrentVideo(lesson.video_url);
  };

  // Save progress every 5 seconds
  useEffect(() => {
    const saveProgress = () => {
      if (!videoRef.current) return;

      fetch(API.LESSON_SAVE_PROGRESS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lesson_id: currentLesson.id,
          last_watched_time: Math.floor(videoRef.current.currentTime),
        }),
      });
    };

    window.addEventListener("beforeunload", saveProgress);
    videoRef.current?.addEventListener("pause", saveProgress);

    return () => {
      window.removeEventListener("beforeunload", saveProgress);
      videoRef.current?.removeEventListener("pause", saveProgress);
    };
  }, [currentLesson?.id]);

  useEffect(() => {
    if (!videoRef.current || !resumeTime) return;

    if (!isMobile) {
      videoRef.current.currentTime = resumeTime;
      videoRef.current.play().catch(() => { });
    }
  }, [resumeTime]);

  const goToSubscription = () => {
    if (!token) navigate("/login");
    else navigate("/subscription");
  };
const handleTimeUpdate = () => {
  if (!videoRef.current || !currentLesson?.id) return;

  const currentTime = videoRef.current.currentTime;

  localStorage.setItem(
    getResumeKey(courseId, currentLesson.id),
    currentTime
  );
};
useEffect(() => {
  if (!currentLesson?.id) return;

  const savedTime = Number(
    localStorage.getItem(`resume_${currentLesson.id}`)
  );

  // ✅ Show resume only if meaningful
  if (savedTime && savedTime > 10) {
    setResumeTime(savedTime);
    setShowResumeBtn(true);
  } else {
    setResumeTime(0);
    setShowResumeBtn(false);
  }
}, [currentLesson]);

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

  const getFileIcon = (url) => {
    if (!url) return "📁";

    const ext = url.split(".").pop().toLowerCase();

    if (ext === "pdf") return "📄";
    if (ext === "ppt" || ext === "pptx") return "📊";
    if (ext === "doc" || ext === "docx") return "📝";
    if (ext === "zip") return "🗜️";

    return "📁";
  };

  useEffect(() => {
    fetch(API.COURSE_LESSONS_RESOURCES(courseId))
      .then((res) => res.json())
      .then((data) => setResources(data))
      .catch((err) => console.error(err));
  }, [courseId]);

  const fetchProgress = useCallback(async () => {
    const token = localStorage.getItem("access");

    try {
      const res = await fetch(API.COURSE_PROGRESS_STATUS(courseId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setProgress({
        completed_lessons: Number(data.completed_lessons) || 0,
        total_lessons: Number(data.total_lessons) || 0,
        is_completed: data.is_completed || false,
      });
    } catch (err) {
      console.error("Progress fetch error:", err);
    }
  }, [courseId]);

  // ✅ CALL IT HERE
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);


  // ✅ USE IT HERE
const markLessonCompleted = async (lessonId) => {
  if (!lessonId) return;

  try {
    await axios.post(
      API.LESSON_COMPLETED,
      { lesson_id: lessonId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // ✅ Always re-fetch from backend
    fetchProgress();

  } catch (err) {
    console.error("Lesson completion error:", err);
  }
};


const handleVideoEnd = () => {
  if (!currentLesson?.id) return;

  localStorage.removeItem(`resume_${currentLesson.id}`);
  setResumeTime(0);
  setShowResumeBtn(false);

  markLessonCompleted(currentLesson.id);
};

const handleExamClick = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    alert("Please login first");
    navigate("/login");
    return;
  }

  try {
    const res = await axios.get(API.START_EXAM(courseId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Exam access success:", res.data);
    navigate(`/examination/${courseId}`);
  } catch (err) {
    console.error("Exam access error:", err.response || err);

    if (err.response?.status === 401) {
      alert("Session expired or invalid token. Please login again.");
      navigate("/login");
    } else if (err.response?.status === 403) {
      alert("❌ Complete all lessons to unlock the exam");
    } else {
      alert("Failed to check exam access");
    }
  }
};

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
        <div className="free-resources">
          <h2>Downloadable Free Resources</h2>

          {resources.length === 0 && <p>No free resources available.</p>}

          <ul>
            {resources.map((res) => (
              <li key={res.id} className="resource-item">
                <a
                  href={res.file_url}   // ✅ CORRECT FIELD
                  download              // ✅ FORCE DOWNLOAD
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  <span className="resource-icon">
                    {getFileIcon(res.file_url)}
                  </span>

                  <span className="resource-title">
                    {res.title}
                  </span>
                </a>

                {res.description && (
                  <p className="resource-desc">{res.description}</p>
                )}

                <div className="resource-meta">
                  {res.file_size_kb && (
                    <span>{res.file_size_kb} KB</span>
                  )}
                  {res.download_count !== undefined && (
                    <span>⬇ {res.download_count}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        {isEnrolled && (
          <><h1>Course Details</h1><div style={{ margin: "15px 0" }}>
            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e0e0e0",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width:
                    progress.total_lessons > 0
                      ? `${(progress.completed_lessons / progress.total_lessons) * 100}%`
                      : "0%",
                  height: "100%",
                  background: "#4caf50",
                  borderRadius: "10px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <p>
              {progress.completed_lessons} / {progress.total_lessons} lessons completed
            </p>

          </div></>
        )}
{progress.is_completed ? (
<button className="exam-btn" onClick={handleExamClick}>
  Take Examination
</button>

) : (
  <p>🔒 Complete all lessons to unlock the examination</p>
)}


      </div>


      {/* Sidebar */}
      <div className="course-sidebar">
        <div className="sticky-card">
          {currentVideo && (
            <video
              ref={videoRef}
              key={currentVideo}
              width="100%"
              controls
              playsInline
              preload="metadata"
              muted={isMobile}
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}

            >
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
