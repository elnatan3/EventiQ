// src/Components/OrganizerDashboard.js
import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase"; // Ensure auth is imported
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../scss/OrganizerDashboard.scss";
import { FaTrash } from "react-icons/fa"; // Import trash icon

function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    imageUrl: null,
  });
  const currentUser = auth.currentUser; // Get the current user

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
    if (!currentUser) return;

    const organizerEmailDomain = currentUser.email.split('@')[1]; // Get email domain
    try {
      await addDoc(collection(db, "events"), {
        ...eventData,
        date: new Date(eventData.date),
        createdAt: new Date(),
        emailDomain: organizerEmailDomain, // Save email domain with event
      });
      alert("Event created successfully!");
      fetchEvents(); // Refresh events list after creation
      setActiveTab("upcoming");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const deleteEvent = async (eventId, imageUrl) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      alert("Event deleted successfully!");
      fetchEvents(); // Refresh events list after deletion
    } catch (error) {
      console.error("Error deleting event:", error);
    }
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
        {activeTab === "create" && (
          <form className="create-event-form" onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="Event Title" onChange={handleInputChange} required />
            <textarea name="description" placeholder="Event Description" onChange={handleInputChange} required />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <input type="datetime-local" name="date" onChange={handleInputChange} required />
            <button type="submit">Create Event</button>
          </form>
        )}
        {activeTab === "upcoming" && (
          <EventList
            events={upcomingEvents}
            onDelete={deleteEvent}
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

function EventList({ events, onDelete, onSeeRegisteredUsers }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-item">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className="event-item__image" />
          )}
          <h4>{event.title}</h4>
          <p>{event.description}</p>
          <p>{new Date(event.date.seconds * 1000).toLocaleString()}</p>
          <button onClick={() => onSeeRegisteredUsers(event.id)}>See Registered Users</button>
          <FaTrash
            className="event-item__delete-icon"
            onClick={() => onDelete(event.id, event.imageUrl)}
          />
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
