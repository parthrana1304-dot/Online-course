import React, { useState } from "react";
import "../styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("Please fill all required fields.");
      setSuccessMsg("");
      return;
    }

    // Simulate API submission
    console.log("Form submitted:", formData);
    setSuccessMsg("✅ Your message has been sent successfully!");
    setErrorMsg("");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have questions? We’re here to help you.</p>
      </div>

      <div className="contact-content">
        <div className="contact-form-container">
          <h2>Send us a message</h2>
          {successMsg && <p className="success-msg">{successMsg}</p>}
          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject (optional)"
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>

        <div className="contact-info-container">
          <h2>Other ways to reach us</h2>
          <div className="contact-card">
            <h3>Customer Support</h3>
            <p>📧 support@yourelearning.com</p>
            <p>📞 +91 12345 67890</p>
          </div>

          <div className="contact-card">
            <h3>Address</h3>
            <p>123 EduStreet, Knowledge City, India</p>
          </div>

          <div className="contact-card">
            <h3>Website</h3>
            <p>🌐 www.yourelearning.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
