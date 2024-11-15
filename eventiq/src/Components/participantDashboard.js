// src/Components/ParticipantDashboard.js
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, addDoc, Timestamp, deleteDoc, doc } from "firebase/firestore";
import "../scss/participantDashboard.scss";
import Alert from "./Alert"; 

function ParticipantDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const currentUser = auth.currentUser;

  // Fetching the events from the events collection and quering the email domains to fetch only the events from same domain organizers
  const fetchEvents = async () => {
    if (!currentUser) return;
    const userDomain = currentUser.email.split('@')[1];

    const eventsRef = collection(db, "events");
    const domainQuery = query(eventsRef, where("emailDomain", "==", userDomain));
    const eventsSnapshot = await getDocs(domainQuery);
    const eventsData = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    setAllEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) > now));
  };

  // Fetches the registration and sets the registered events, upcoming events, past events
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

  // Handles the situation when participant clicks on register
  const handleRegister = async (eventId, eventDate) => {
    try {
      if (!currentUser) {
        setAlertMessage("Please log in to register for events.");
        return;
      }

      const now = new Date();
      if (new Date(eventDate.seconds * 1000) <= now) {
        setAlertMessage("Cannot register for past events.");
        return;
      }

      await addDoc(collection(db, "registrations"), {
        eventId,
        displayName: currentUser.displayName,
        registeredAt: Timestamp.now(),
      });
      setAlertMessage("Successfully registered for the event!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error registering for event:", error);
      setAlertMessage("Error registering for event.");
    }
  };

  // Handles the situation when a participant cancels registeration by removing the registration from the collection.
  const handleCancelRegistration = async (eventId) => {
    try {
      if (!currentUser) return;

      const registrationsRef = collection(db, "registrations");
      const registrationQuery = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("displayName", "==", currentUser.displayName)
      );
      const registrationSnapshot = await getDocs(registrationQuery);

      if (!registrationSnapshot.empty) {
        await deleteDoc(registrationSnapshot.docs[0].ref);
        setAlertMessage("Registration cancelled successfully!");
        setRefresh((prev) => !prev);
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      setAlertMessage("Error cancelling registration.");
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
          <EventList events={upcomingEvents} registeredEvents={registeredEvents} onCancel={handleCancelRegistration} />
        )}
        {activeTab === "past" && (
          <EventList events={pastEvents} registeredEvents={registeredEvents} />
        )}
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />} {/* Render Alert */}
    </div>
  );
}

function EventList({ events, onRegister, onCancel, registeredEvents }) {
  return (
    <div className="event-list">
      {events.length > 0 ? (
        events.map((event) => (
          <div key={event.id} className="event-item">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="event-item__image" />
            )}
            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <p>{new Date(event.date.seconds * 1000).toLocaleString()}</p>
            {onRegister && !registeredEvents.includes(event.id) && (
              <button onClick={() => onRegister(event.id, event.date)}>Register</button>
            )}
            {registeredEvents.includes(event.id) && onCancel ? (
              <button onClick={() => onCancel(event.id)}>Cancel Registration</button>
            ) : registeredEvents.includes(event.id) ? (
              <p>Already registered</p>
            ) : null}
          </div>
        ))
      ) : (
        <p>No events available.</p>
      )}
    </div>
  );
}

export default ParticipantDashboard;
