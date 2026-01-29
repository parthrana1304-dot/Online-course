// ExamFailed.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/exam.css";

const ExamFailed = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  return (
  <div className="exam-failed-wrapper">
    <h1>😞 Better Luck Next Time!</h1>
    <p>
      You did not achieve the passing score. Don't worry, you can try again!
    </p>

    <button
      className="exam-failed-btn retry"
      onClick={() => navigate(`/examination/${courseId}`)}
    >
      Retry Exam
    </button>

    <button
      className="exam-failed-btn back"
      onClick={() => navigate("/")}
    >
      Back to Dashboard
    </button>
  </div>
);
};

export default ExamFailed;
