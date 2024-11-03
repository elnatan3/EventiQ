// src/Components/ParticipantDashboard.js
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";
import "../scss/ParticipantDashboard.scss";

function ParticipantDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]); 
  const [refresh, setRefresh] = useState(false); 
  const currentUser = auth.currentUser;

  // Fetch all future events
  const fetchEvents = async () => {
    const eventsRef = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsRef);
    const eventsData = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    setAllEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) > now));
  };

  // Fetch user-registered events
  const fetchUserRegistrations = async () => {
    if (!currentUser) return;

    const registrationsRef = collection(db, "registrations");
    const userRegistrationsQuery = query(registrationsRef, where("displayName", "==", currentUser.displayName));
    const registrationsSnapshot = await getDocs(userRegistrationsQuery);
    const registeredEventIds = registrationsSnapshot.docs.map((doc) => doc.data().eventId);

    if (registeredEventIds.length === 0) {
      setUpcomingEvents([]);
      setPastEvents([]);
      setRegisteredEvents([]);
      return;
    }

    const eventsRef = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsRef);
    const eventsData = eventsSnapshot.docs
      .filter((doc) => registeredEventIds.includes(doc.id))
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    setUpcomingEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) > now));
    setPastEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) <= now));
    setRegisteredEvents(registeredEventIds);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentUser) fetchUserRegistrations();
  }, [currentUser, refresh]);

  const handleRegister = async (eventId, eventDate) => {
    try {
      if (!currentUser) {
        alert("Please log in to register for events.");
        return;
      }

      const now = new Date();
      if (new Date(eventDate.seconds * 1000) <= now) {
        alert("Cannot register for past events.");
        return;
      }

      await addDoc(collection(db, "registrations"), {
        eventId,
        displayName: currentUser.displayName,
        registeredAt: Timestamp.now(),
      });
      alert("Successfully registered for the event!");

      setRefresh((prev) => !prev); 
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Participant Dashboard</h2>
      <div className="dashboard__tabs">
        <button onClick={() => setActiveTab("all")}>All Events</button>
        <button onClick={() => setActiveTab("upcoming")}>Upcoming Events</button>
        <button onClick={() => setActiveTab("past")}>Past Events</button>
      </div>
      <div className="dashboard__content">
        {activeTab === "all" && (
          <EventList events={allEvents} onRegister={handleRegister} registeredEvents={registeredEvents} />
        )}
        {activeTab === "upcoming" && (
          <EventList events={upcomingEvents} registeredEvents={registeredEvents} />
        )}
        {activeTab === "past" && (
          <EventList events={pastEvents} registeredEvents={registeredEvents} />
        )}
      </div>
    </div>
  );
}

function EventList({ events, onRegister, registeredEvents }) {
  return (
    <div className="event-list">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="event-item">
            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <p>{new Date(event.date.seconds * 1000).toLocaleString()}</p>
            {onRegister && !registeredEvents.includes(event.id) && (
              <button onClick={() => onRegister(event.id, event.date)}>Register</button>
            )}
            {registeredEvents.includes(event.id) && <p>Already registered</p>}
          </div>
        ))
      ) : (
        <p>No events available.</p>
      )}
    </div>
  );
}

export default ParticipantDashboard;
