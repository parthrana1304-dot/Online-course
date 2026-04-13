import React, { useEffect, useState } from "react";
import api from "../api";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("my-courses/").then((res) => setCourses(res.data));
  }, []);

  return (
    <div>
      <h1>📚 My Courses</h1>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
};

export default MyCourses;
