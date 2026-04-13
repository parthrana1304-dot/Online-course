import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import axios
import "../styles/UserProfile.css";
import { API } from "../api/config";
import jsPDF from "jspdf";

const BASE_URL = "http://127.0.0.1:8000";

/* ================= IMAGE HELPER ================= */
const getImageUrl = (path) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/media")) return `${BASE_URL}${path}`;
  return `${BASE_URL}/media/${path}`;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Get course ID from certificate object
  const getCertCourseId = (cert) =>
    typeof cert.course === "object" ? cert.course.id : cert.course;

  // Download certificate as PDF using jsPDF
  const handleDownloadCertificate = (cert) => {
    
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [700, 500],
    });

    // ================= BACKGROUND =================
    doc.setFillColor(245, 245, 245); // light grey background
    doc.rect(0, 0, 700, 500, "F");

    // ================= BORDER =================
    doc.setDrawColor(99, 102, 241); // purple border
    doc.setLineWidth(4);
    doc.rect(15, 15, 670, 470, "S");

    // ================= HEADER =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(30, 58, 138); // dark blue
    doc.text("EDUPRO UNIVERSITY", 350, 70, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Excellence in Online Education", 350, 95, { align: "center" });

    // ================= TITLE =================
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 102, 0); // orange
    doc.text("CERTIFICATE OF ACHIEVEMENT", 350, 150, { align: "center" });

    // ================= BODY =================
    doc.setFont("times", "normal");
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text("This is to certify that", 350, 200, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(user?.email || "Student Name", 350, 240, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(16);
    doc.text(
      `has successfully completed the course: ${cert.course?.title || "N/A"}`,
      350,
      280,
      { align: "center" }
    );

    const date = new Date().toLocaleDateString();
    doc.text(`Awarded on: ${date}`, 350, 320, { align: "center" });

    // ================= SIGNATURE LINES =================
    doc.setLineWidth(1.5);
    doc.line(100, 400, 250, 400); // left line
    doc.line(450, 400, 600, 400); // right line

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Controller of Examinations", 175, 420, { align: "center" });
    doc.text("Vice Chancellor", 525, 420, { align: "center" });

    // ================= OPTIONAL IMAGE =================
    if (cert.certificate_file || cert.thumbnail || cert.image) {
      const imageUrl = getImageUrl(cert.certificate_file || cert.thumbnail || cert.image);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        doc.addImage(img, "PNG", 50, 360, 100, 100); // optional logo/seal
        doc.save(`${cert.title || "certificate"}.pdf`);
      };
      img.onerror = () => {
        doc.save(`${cert.title || "certificate"}.pdf`);
      };
    } else {
      doc.save(`${cert.title || "certificate"}.pdf`);
    }

  };

  // Generate certificate by calling API
  const handleGenerateCertificate = async (courseId) => {
    try {
      const res = await axios.get(API.GENERATE_CERTIFICATE(courseId), {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // optional if API returns PDF
      });

      alert("Certificate generated successfully 🎉");
      // Reload certificates after generating
      loadCertificates();
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificate");
    }
  };

  /* ================= LOAD PROFILE ================= */
  const loadCertificates = async () => {
    try {
      const res = await axios.get(API.CERTIFICATE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const certList = res.data.results ?? res.data.data ?? res.data ?? [];
      const uniqueCerts = Array.from(
        new Map(certList.map((c, idx) => [c.id ?? `${c.course}-${idx}`, c])).values()
      );

      setCertificates(uniqueCerts);
    } catch (err) {
      console.error("Certificate fetch failed:", err);
      setCertificates([]);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);

        // Load user
        const userRes = await axios.get(API.USER_ME, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Load enrolled courses
        const enrollRes = await axios.get(API.ENROLL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawCourses = (enrollRes.data.results ?? enrollRes.data ?? []).map(
          (item) => item.course
        ).filter((c) => c && c.id);

        const uniqueCourses = Array.from(
          new Map(rawCourses.map((c) => [c.id, c])).values()
        );
        setCourses(uniqueCourses);

        // Load certificates
        await loadCertificates();
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, navigate]);

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-page">
      {/* ================= HEADER ================= */}
      <div className="profile-header">
        <img
          className="profile-avatar"
          src={getImageUrl(user?.avatar)}
          alt={user?.username}
          onError={(e) => (e.target.src = "/no-image.png")}
        />

        <div className="profile-info">
          <h1>{user?.username}</h1>
          <p>{user?.email}</p>

          <div className="profile-stats">
            <div>
              <strong>{courses.length}</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>{certificates.length}</strong>
              <span>Certificates</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ================= COURSES ================= */}
      <section className="section">
        <h2>My Courses</h2>
        {courses.length === 0 ? (
          <p>You haven’t enrolled in any courses yet.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              const hasCertificate = certificates.some(
                (cert) => getCertCourseId(cert) === course.id
              );

              const examPassed =
                course.exam_completed === true ||
                course.exam_status === "passed";

              return (
                <div
                  key={course.id}
                  className="course-card clickable"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="category-img"
                  />
                  <h3>{course.title}</h3>
                  <p>{course.level || "Beginner"}</p>

                  {examPassed && !hasCertificate && (
                    <button
                      className="generate-cert-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateCertificate(course.id);
                      }}
                    >
                      Generate Certificate
                    </button>
                  )}

                  {hasCertificate && (
                    <p className="cert-exists">✅ Certificate Earned</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= CERTIFICATES ================= */}
      <section className="section">
        <h2>My Certificates</h2>
        {certificates.length === 0 ? (
          <p>No certificates earned yet.</p>
        ) : (
          <div className="certificates-carousel">
            {certificates.map((cert, index) => (
              <div
                key={cert.id ?? `${cert.course}-${index}`}
                className="certificate-card"
              >
                <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-QKzBAHaZ2DuXFHig-yThJLoEC3R3dJ05qg&s"} alt="Certificate" />
                <p>{cert.title || "Course Certificate"}</p>
                <button
                  className="download-cert-btn"
                  onClick={() => handleDownloadCertificate(cert)}
                >
                  📄 Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
