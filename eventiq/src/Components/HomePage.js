// src/components/HomePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import "../scss/HomePage.scss";

function HomePage() {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
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
    "24/7 support and assistance."
  ];

  return (
    <div className="homepage">
      <div className="theme-toggle" onClick={toggleTheme}>
        <span>{theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
      </div>

      <header className="homepage__header">
        <h1 className="homepage__title">
          EventIQ <span className="homepage__subtitle">The Future of Events</span>
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

      {/* SVG Background Design */}
      <div className="homepage__background">
        <svg className="homepage__svg-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="url(#moonGradient)" />
          <defs>
            <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF4E0" />
              <stop offset="100%" stopColor="#B0A090" />
            </radialGradient>
          </defs>
        </svg>
        <svg className="homepage__svg-earth" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="50" fill="url(#earthGradient)" />
          <defs>
            <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67C8FF" />
              <stop offset="100%" stopColor="#006994" />
            </radialGradient>
          </defs>
        </svg>
        <div className="homepage__stars"></div>
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
      <p>{feature}</p>
    </div>
  );
}

export default HomePage;
