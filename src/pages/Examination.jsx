import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api/config";
import { useNavigate, useParams } from "react-router-dom";

const Examination = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [examStatus, setExamStatus] = useState(""); 
  // allowed | failed | passed

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ================= LOAD EXAM ================= */
  const loadExam = async (retry = false) => {
    setLoading(true);

    try {
      const res = await axios.get(API.START_EXAM(courseId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: retry ? { retry: 1 } : {},
      });

      console.log("EXAM RESPONSE:", res.data);

      /* ===== HANDLE STATUS FROM BACKEND ===== */
      if (res.data.status === "passed") {
        navigate(`/course/${courseId}/success`);
        return;
      }

      if (res.data.status === "failed") {
        setExamStatus("failed");
        setQuestions([]);
        return;
      }

      /* ===== LOAD QUESTIONS ===== */
      const loadedQuestions =
        res.data.questions ||
        res.data.data ||
        res.data.exam?.questions ||
        [];

      setQuestions(loadedQuestions.slice(0, 10)); // limit to 20 questions
      setAnswers({});
      setExamStatus("allowed");
    } catch (err) {
      console.error("START EXAM ERROR:", err);

      const status = err.response?.status;
      const backendStatus = err.response?.data?.status;

      if (status === 401) {
        navigate("/login");
      } else if (backendStatus === "passed") {
        navigate(`/course/${courseId}/success`);
      } else if (backendStatus === "failed") {
        setExamStatus("failed");
        setQuestions([]);
      } else {
        alert("Unable to start exam. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, []);

  /* ================= SELECT ANSWER ================= */
  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  /* ================= SUBMIT EXAM ================= */
  const submitExam = async () => {
    if (questions.length === 0) return;

    const payload = Object.entries(answers).map(
      ([questionId, answer]) => ({
        question_id: Number(questionId),
        answer,
      })
    );

    try {
      const res = await axios.post(
        API.SUBMIT_EXAM,
        {
          course_id: courseId,
          answers: payload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("SUBMIT RESPONSE:", res.data);

      if (res.data.passed) {
        navigate(`/course/${courseId}/success`);
      } else {
        setExamStatus("failed");
        setQuestions([]);
      }
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Exam submission failed. Please try again.");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading exam...</p>;
  }

  return (
    <div className="exam-wrapper">
      <h1>Examination</h1>

      {/* ================= EXAM QUESTIONS ================= */}
      {examStatus === "allowed" && (
        <>
          {questions.length === 0 && (
            <p>No questions available for this exam.</p>
          )}

          {questions.map((q, index) => (
            <div key={q.id || index} className="question-card">
              <h4>
                {index + 1}. {q.text || q.question}
              </h4>

              {["A", "B", "C", "D"].map((letter) => (
                <label key={letter} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === letter}
                    onChange={() => handleSelect(q.id, letter)}
                  />
                  {q[`option_${letter.toLowerCase()}`] ||
                    q[`option${letter}`]}
                </label>
              ))}
            </div>
          ))}

          {questions.length > 0 && (
            <button
              onClick={submitExam}
              style={{ marginTop: 20 }}
            >
              Submit Exam
            </button>
          )}
        </>
      )}

      {/* ================= FAILED ================= */}
      {examStatus === "failed" && (
        <>
          <p style={{ color: "red", fontWeight: "bold" }}>
            ❌ You failed the exam. Try again.
          </p>

          <button
            onClick={() => loadExam(true)}
            style={{
              marginTop: 20,
              background: "#f44336",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry Exam
          </button>
        </>
      )}
    </div>
  );
};

export default Examination;
