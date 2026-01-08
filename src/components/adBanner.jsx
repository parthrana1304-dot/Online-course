import React, { useEffect, useState } from "react";
import axios from "axios";

const AdBanner = ({ position }) => {
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/ads/${position}/`)
      .then((res) => setAds(res.data));
  }, [position]);

  // Rotation
  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % ads.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [ads]);

  if (!ads.length) return null;

  const ad = ads[index];

  return (
    <div className={`ad ad-${position}`}>
      <img
        src="https://img.freepik.com/free-vector/digital-marketing-banner_23-2148894826.jpg"
        alt="Advertisement"
        style={{ width: "100%", borderRadius: "10px" }}
      />
    </div>
  );
};

export default AdBanner;
