// src/Components/OrganizerDashboard.js
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../scss/OrganizerDashboard.scss";

function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const fetchEvents = async () => {
    const eventsRef = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsRef);
    const eventsData = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    setUpcomingEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) >= now));
    setPastEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) < now));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchRegisteredUsers = async (eventId) => {
    const registrationsRef = collection(db, "registrations");
    const registeredUsersQuery = query(registrationsRef, where("eventId", "==", eventId));
    const registrationsSnapshot = await getDocs(registeredUsersQuery);
    const usersData = registrationsSnapshot.docs.map((doc) => doc.data().displayName);
    setRegisteredUsers(usersData);
  };

  return (
    <div className="dashboard">
      <h2>Organizer Dashboard</h2>
      <div className="dashboard__tabs">
        <button onClick={() => setActiveTab("create")}>Create Event</button>
        <button onClick={() => setActiveTab("upcoming")}>Upcoming Events</button>
        <button onClick={() => setActiveTab("past")}>Past Events</button>
      </div>
      <div className="dashboard__content">
        {activeTab === "create" && <CreateEventForm refreshEvents={fetchEvents} />}
        {activeTab === "upcoming" && (
          <EventList
            events={upcomingEvents}
            onSeeRegisteredUsers={(eventId) => {
              fetchRegisteredUsers(eventId);
              setSelectedEvent(eventId);
            }}
          />
        )}
        {activeTab === "past" && (
          <EventList
            events={pastEvents}
            onSeeRegisteredUsers={(eventId) => {
              fetchRegisteredUsers(eventId);
              setSelectedEvent(eventId);
            }}
          />
        )}
        {selectedEvent && (
          <RegisteredUsersList
            users={registeredUsers}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
}

function CreateEventForm({ refreshEvents }) {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    imageUrl: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `event-images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setEventData((prev) => ({ ...prev, imageUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "events"), {
        ...eventData,
        date: new Date(eventData.date),
        createdAt: new Date(),
      });
      alert("Event created successfully!");
      refreshEvents();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Event Title" onChange={handleInputChange} required />
      <textarea name="description" placeholder="Event Description" onChange={handleInputChange} required />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <input type="datetime-local" name="date" onChange={handleInputChange} required />
      <button type="submit">Create Event</button>
    </form>
  );
}

function EventList({ events, onSeeRegisteredUsers }) {
  const [registrationCounts, setRegistrationCounts] = useState({});

  useEffect(() => {
    const fetchRegistrationCounts = async () => {
      const counts = {};
      for (const event of events) {
        const registrationsRef = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(
          query(registrationsRef, where("eventId", "==", event.id))
        );
        counts[event.id] = registrationsSnapshot.size;
      }
      setRegistrationCounts(counts);
    };

    fetchRegistrationCounts();
  }, [events]);

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-item">
          <h4>{event.title}</h4>
          <p>{event.description}</p>
          <p>{new Date(event.date.seconds * 1000).toLocaleString()}</p>
          <p>Total Registered: {registrationCounts[event.id] || 0}</p>
          <button onClick={() => onSeeRegisteredUsers(event.id)}>See Registered Users</button>
        </div>
      ))}
    </div>
  );
}

function RegisteredUsersList({ users, onClose }) {
  return (
    <div className="registered-users-list">
      <h3>Registered Users</h3>
      <button onClick={onClose}>Close</button>
      <ul>
        {users.length > 0 ? (
          users.map((displayName, index) => <li key={index}>{displayName}</li>)
        ) : (
          <li>No registered users.</li>
        )}
      </ul>
    </div>
  );
}

export default OrganizerDashboard;
