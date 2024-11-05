// src/components/ChooseRole.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/ChooseRole.scss";

function ChooseRole({ signInWithGoogle }) {
  const navigate = useNavigate();

  const handleRoleSelect = async (selectedRole) => {
    try {
      await signInWithGoogle(selectedRole);
      navigate(selectedRole === "Organizer" ? "/organizer-dashboard" : "/participant-dashboard");
    } catch (error) {
      console.error("Error selecting role:", error);
    }
  };

  

  return (
    <div className="choose-role">
      <h2>Select Your Role</h2>

      <div className="choose-role__button-container">
        <div className="choose-role__button-wrapper">
          <button
            className="choose-role__button"
            onClick={() => handleRoleSelect("Organizer")}
          >
            <span className="choose-role__button-text">Organizer</span>
            <div className="choose-role__description">Manage and create events</div>
          </button>
        </div>
        <div className="choose-role__button-wrapper">
          <button
            className="choose-role__button"
            onClick={() => handleRoleSelect("Participant")}
          >
            <span className="choose-role__button-text">Participant</span>
            <div className="choose-role__description">Join and participate in events</div>
          </button>
        </div>
      </div>

      <div className="choose-role__background">
        <div className="choose-role__moving-object"></div>
        <div className="choose-role__orbiting-circle"></div>
      </div>
    </div>
  );
}

export default ChooseRole;
