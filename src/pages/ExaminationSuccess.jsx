// ExamSuccess.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../api/config";
import "../styles/exam.css";

const ExamSuccess = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [certificateUrl, setCertificateUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let objectUrl = null;

    const fetchCertificate = async () => {
      try {
        const res = await axios.get(
          API.GENERATE_CERTIFICATE(courseId),
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob", // IMPORTANT
          }
        );

        objectUrl = URL.createObjectURL(res.data);
        setCertificateUrl(objectUrl);
      } catch (err) {
        console.error("Certificate fetch error:", err);

        if (err.response?.status === 403) {
          setError("You are not allowed to view this certificate.");
        } else {
          setError("Failed to load certificate. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();

    // cleanup blob URL
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [courseId, token, navigate]);

  const downloadCertificate = () => {
    if (!certificateUrl) return;

    const link = document.createElement("a");
    link.href = certificateUrl;
    link.download = `certificate_course_${courseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading certificate...</p>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>❌ {error}</h2>
        <button onClick={() => navigate("/")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="exam-result-wrapper">
  <h1>🎉 Congratulations!</h1>
  <p className="success-text">You have successfully passed the exam.</p>

  <div className="certificate-frame">
    <iframe
      src={certificateUrl}
      title="Certificate Preview"
      width="100%"
      height="700"
    />
  </div>

  <button
    className="result-btn primary"
    onClick={downloadCertificate}
    style={{ marginTop: "20px" }}
  >
    ⬇️ Download Certificate
  </button>

  <div style={{ marginTop: "25px" }}>
    <button className="result-btn" onClick={() => navigate("/")}>
      Back to Dashboard
    </button>
  </div>
</div>

  );
};

export default ExamSuccess;
