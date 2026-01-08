import React from "react";
import "../styles/footer.css";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section about">
          <h3>EduSite</h3>
          <p>
            EduSite is your one-stop platform to learn coding, design, and
            development. Join thousands of learners worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/course">Courses</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Email: support@edusite.com</p>
          <p>Phone: +91 1234567890</p>
          <p>Address: 123 Edu Street, Learning City</p>
        </div>

        {/* Social Media */}
        <div className="footer-section social">
  <h3>Follow Us</h3>
  <div className="social-icons">
    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
      <FaFacebookF size={28} />
    </a>
    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
      <FaInstagram size={28} />
    </a>
    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
      <FaLinkedinIn size={28} />
    </a>
  </div>
</div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EduSite. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
