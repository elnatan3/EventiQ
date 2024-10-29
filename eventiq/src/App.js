// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { auth, provider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import HomePage from "./Components/HomePage";
import ChooseRole from "./Components/ChooseRole";
import Dashboard from "./Components/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
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
          {user && <Route path="/dashboard" element={<Dashboard user={user} />} />}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
