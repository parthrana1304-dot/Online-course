import React from "react";
import "../styles/about.css";

const teamMembers = [
  { id: 1, name: "Parth Rana", role: "Founder & CEO", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Jane Doe", role: "Lead Instructor", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "John Smith", role: "UI/UX Designer", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 4, name: "Emily Clark", role: "Marketing Head", img: "https://randomuser.me/api/portraits/women/46.jpg" },
];

const AboutPage = () => {
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="hero-text">
          <h1>About Our E-Learning Platform</h1>
          <p>
            Empowering learners worldwide with high-quality online courses from expert instructors.
          </p>
        </div>
        <img
          src="https://img.freepik.com/free-vector/online-education-concept-illustration_114360-8985.jpg"
          alt="About Hero"
          className="hero-img"
        />
      </section>

      {/* MISSION & VISION */}
      <section className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>
            To make learning accessible to everyone, everywhere. We aim to provide the highest quality courses 
            that help individuals achieve their personal and professional goals.
          </p>
        </div>
        <div className="vision">
          <h2>Our Vision</h2>
          <p>
            To be the most trusted and innovative online learning platform, connecting learners and instructors 
            globally while fostering a culture of continuous growth.
          </p>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src="https://img.icons8.com/color/96/000000/online-course.png" alt="Online Courses" />
            <h3>Extensive Courses</h3>
            <p>Thousands of courses covering diverse topics and skills.</p>
          </div>
          <div className="feature-card">
            <img src="https://img.icons8.com/color/96/000000/video.png" alt="Video Lessons" />
            <h3>High-Quality Video Lessons</h3>
            <p>Engaging video lectures by experienced instructors.</p>
          </div>
          <div className="feature-card">
            <img src="https://img.icons8.com/color/96/000000/certificate.png" alt="Certificate" />
            <h3>Certification</h3>
            <p>Earn certificates to showcase your achievements.</p>
          </div>
          <div className="feature-card">
            <img src="https://img.icons8.com/color/96/000000/mobile-learning.png" alt="Mobile Learning" />
            <h3>Learn Anywhere</h3>
            <p>Access courses on mobile, tablet, or desktop anytime.</p>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="statistics">
        <h2>Our Achievements</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>10k+</h3>
            <p>Students Enrolled</p>
          </div>
          <div className="stat-card">
            <h3>500+</h3>
            <p>Expert Instructors</p>
          </div>
          <div className="stat-card">
            <h3>1200+</h3>
            <p>Courses Available</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Countries Served</p>
          </div>
        </div>
      </section>

      {/* TEAM MEMBERS */}
      <section className="team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <img src={member.img} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta">
        <h2>Start Your Learning Journey Today!</h2>
        <p>Join thousands of learners and unlock your potential with our online courses.</p>
        <button onClick={() => window.location.href = "/course"}>Browse Courses</button>
      </section>

    </div>
  );
};

export default AboutPage;
