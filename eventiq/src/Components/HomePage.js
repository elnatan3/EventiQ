// src/components/HomePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import "../scss/HomePage.scss";

function HomePage() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleGetStarted = () => {
    navigate("/choose-role");
  };

  const features = [
    "Effortless event registration and organization.",
    "Secure Google Sign-In for access control.",
    "Exclusive domain-based event access.",
    "Advanced analytics and reporting.",
    "Customized event branding.",
    "24/7 support and assistance.",
  ];

  return (
    <div className="homepage">
      <div className="theme-toggle" onClick={toggleTheme}>
        <span>{theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
      </div>

      <header className="homepage__header">
        <h1 className="homepage__title" style={{ fontFamily: "'Pacifico', cursive", fontSize: '60px' }}>
          EventIQ 
        </h1>
      </header>

      <div className="homepage__content">
        <div className="homepage__features">
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} index={index} />
          ))}
        </div>
        <button className="homepage__button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>

      <div className="homepage__background">
        {/* Enhanced Background with Multiple Animated Elements */}
        <div className="homepage__curve"></div>
        <div className="moon"></div>
        <div className="earth"></div>
        <div className="floating-star"></div>
        <div className="orbiting-circle"></div>
      </div>
    </div>
  );
}

function FeatureItem({ feature, index }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`homepage__feature-item ${inView ? "is-visible" : ""}`}
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      <svg
        className="homepage__feature-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
      >
        <path
          d="M0,50 Q100,-20 200,50 T400,50"
          fill="none"
          stroke="#006994"
          strokeWidth="8"
        />
      </svg>
      <p>{feature}</p>
    </div>
  );
}

export default HomePage;
