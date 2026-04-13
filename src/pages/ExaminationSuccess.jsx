// ExamSuccess.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api/config";
import "../styles/exam.css";
import { getCertificateBlobUrl } from "../utils/certificate";

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

  let objectUrl;

  const loadCertificate = async () => {
    try {
      objectUrl = await getCertificateBlobUrl(courseId, token);
      setCertificateUrl(objectUrl);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You are not eligible for this certificate.");
      } else {
        setError("Failed to load certificate.");
      }
    } finally {
      setLoading(false);
    }
  };

  loadCertificate();

  return () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}, [courseId]);


  if (loading) return <p className="center">Loading certificate...</p>;

  if (error) {
    return (
      <div className="exam-result-wrapper">
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
  onClick={async () => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    try {
      const url = await getCertificateBlobUrl(courseId, token);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate_Course_${courseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Certificate not available yet.");
    }
  }}
>
  📄 View / Download Certificate
</button>


      <button
        className="result-btn"
        style={{ marginTop: 20 }}
        onClick={() => navigate("/")}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ExamSuccess;
