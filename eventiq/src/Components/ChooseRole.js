// src/components/ChooseRole.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/ChooseRole.scss"; 

function ChooseRole({ signInWithGoogle }) {
  const navigate = useNavigate();

  const handleRoleSelect = async (selectedRole) => {
    try {
      await signInWithGoogle(); // Wait for Google sign-in to complete
      navigate("/dashboard");   // Only navigate after sign-in
    } catch (error) {
      console.error("Error selecting role:", error);
    }
  };

  return (
    <div className="choose-role">
      <h2>Select Your Role</h2>
      <div className="choose-role__buttons">
        <button className="choose-role__button" onClick={() => handleRoleSelect("Organizer")}>
          Organizer
        </button>
        <button className="choose-role__button" onClick={() => handleRoleSelect("Participant")}>
          Participant
        </button>
      </div>
    </div>
  );
}

export default ChooseRole;
