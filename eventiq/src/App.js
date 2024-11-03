// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { db, auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import HomePage from "./Components/HomePage";
import ChooseRole from "./Components/ChooseRole";
import OrganizerDashboard from "./Components/organizerDashboard";
import ParticipantDashboard from "./Components/participantDashboard";

function App() {
  const [user, setUser] = useState(null);

  const signInWithGoogle = async (role) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        name: user.displayName,
        email: user.email,
      };
      setUser(user); 

      // Determine the collection based on the role
      const collectionName = role === "Organizer" ? "organizers" : "participants";
      const userCollection = collection(db, collectionName);

      // Query to check if the email already exists
      const emailQuery = query(userCollection, where("email", "==", user.email));
      const querySnapshot = await getDocs(emailQuery);

      // Add user to the collection only if email does not exist
      if (querySnapshot.empty) {
        await addDoc(userCollection, userData);
        console.log("User added to the collection:", userData);
      } else {
        console.log("User already exists in the collection:", userData);
      }
    } catch (error) {
      console.error("Error with Google Sign-In:", error);
    }
  };


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/choose-role" element={<ChooseRole signInWithGoogle={signInWithGoogle} />} />
          {user && (
            <>
              <Route path="/organizer-dashboard" element={<OrganizerDashboard user={user} />} />
              <Route path="/participant-dashboard" element={<ParticipantDashboard user={user} />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
