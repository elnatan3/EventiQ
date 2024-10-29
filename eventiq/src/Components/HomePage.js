import React from "react";
import { useNavigate } from "react-router-dom";
import "../scss/HomePage.scss"; 

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/choose-role");
  };

  return (
    <div className="homepage">
      <header className="homepage__header">
        <h1 className="homepage__title">EventIQ</h1>
        <p className="homepage__subtitle">
          Welcome to EventIQ, your all-in-one platform for organizing and joining events.
          With EventIQ, you can:
        </p>
        <ul className="homepage__features">
          <li>Organize and register for events with ease.</li>
          <li>Experience secure registration through Google Sign-In.</li>
          <li>Communicate within your organization’s email domain for seamless scalability.</li>
        </ul>
      </header>
      <div className="homepage__action">
        <button className="homepage__button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default HomePage;
