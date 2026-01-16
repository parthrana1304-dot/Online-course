import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/Progress.css";

const Progress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fallbackImg = "https://placehold.co/80x80?text=Edu+Pro";

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get("/course-progress/");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
        setError("Unauthorized or server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) return <p>Loading progress...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!courses.length) return <p>No course progress found.</p>;

  return (
    <div className="progress-container">
      <h2>My Course Progress</h2>
      {courses.map((course, index) => (
        <div key={index} className="progress-card">
          <img
            src={course.course_image || fallbackImg}
            alt={course.course_title}
            onError={(e) => (e.target.src = fallbackImg)}
          />
          <div className="progress-info">
            <h4>{course.course_title}</h4>
            <p>Completed Lessons: {course.completed_lessons}</p>
            <p>{course.completion_percentage.toFixed(2)}% completed</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${course.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Progress;
