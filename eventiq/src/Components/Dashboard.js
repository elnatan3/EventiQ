// src/components/Dashboard.js
import React from "react";
import "../scss/Dashboard.scss";

function Dashboard({ user }) {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Welcome, {user.displayName}</h1>
        <p>Your event management hub.</p>
      </header>
      <section className="dashboard__content">
        <div className="dashboard__events">
          <h2>My Events</h2>
          <p>View and manage your registered events here.</p>
          {/* Event list or cards will go here */}
        </div>
        <div className="dashboard__create">
          <h2>Create New Event</h2>
          <p>Organize a new event and manage attendees.</p>
          {/* Event creation form will go here */}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
