import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api/config";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/exam.css";

const Examination = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("");

  // Load exam questions
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadExam = async () => {
      try {
        const res = await axios.get(API.START_EXAM(courseId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data.questions || []);
      } catch (err) {
        if (err.response?.status === 403) {
          alert("❌ Complete all lessons first!");
          navigate(API.COURSE_BY_ID(courseId));
        } else {
          alert("Failed to load exam");
        }
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [courseId, token, navigate]);

  // Handle answer selection
  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // Submit exam
  const submitExam = async () => {
    if (!selectedOption) {
      alert("Please select an answer");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/exams/submit/",
        {
          course_id: courseId,
          selected_option: selectedOption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.passed === true) {
        navigate(`/course/${courseId}/success`);
      } else {
        navigate(`/course/${courseId}/failed`);
      }
    } catch (err) {
      console.error("Submit exam error:", err.response?.data || err);
      alert("Exam submission failed");
    }
  };

  if (loading) return <p>Loading exam...</p>;

  return (
    <div className="exam-wrapper">
      <h1>Examination</h1>

      {questions.length === 0 && <p>No questions available.</p>}

      {questions.map((q) => (
        <div key={q.id} className="question-card" style={{ marginBottom: "20px" }}>
          <h4>{q.text}</h4>

          {q.question_type === "MCQ"
            ? ["A", "B", "C", "D"]
              .filter((letter) => q[`option_${letter.toLowerCase()}`])
              .map((letter) => (
                <label key={letter} style={{ display: "block", margin: "5px 0" }}>
                  <input
                    type="radio"
                    name="answer"
                    value={letter}
                    checked={selectedOption === letter}
                    onChange={() => setSelectedOption(letter)}
                  />

                  {q[`option_${letter.toLowerCase()}`]}
                </label>
              ))
            : (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder="Your answer"
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            )}
        </div>
      ))}

      {questions.length > 0 && (
        <button
          onClick={submitExam}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Submit Exam
        </button>
      )}
    </div>
  );
};

export default Examination;
