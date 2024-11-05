// src/Components/OrganizerDashboard.js
import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../scss/OrganizerDashboard.scss";
import Alert from "./Alert";
import { FaTrash } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";


function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    imageUrl: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const currentUser = auth.currentUser;

  const fetchEvents = async () => {
    const eventsRef = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsRef);
    const eventsData = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    setUpcomingEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) >= now));
    setPastEvents(eventsData.filter((event) => new Date(event.date.seconds * 1000) < now));
    fetchRegistrationCounts(eventsData.map(event => event.id)); 
  };
  // Fetches registration counts to show on each event card created by the specific organizer
  const fetchRegistrationCounts = async (eventIds) => {
    const counts = {};
    for (const eventId of eventIds) {
      const registrationsRef = collection(db, "registrations");
      const registeredUsersQuery = query(registrationsRef, where("eventId", "==", eventId));
      const registrationsSnapshot = await getDocs(registeredUsersQuery);
      counts[eventId] = registrationsSnapshot.size; 
    }
    setRegistrationCounts(counts);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for handling uploading image into the firebase storage
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `event-images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setEventData((prev) => ({ ...prev, imageUrl }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Hander for creating the event and storing it in firestore database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const organizerEmailDomain = currentUser.email.split('@')[1];
    try {
      await addDoc(collection(db, "events"), {
        ...eventData,
        date: new Date(eventData.date),
        createdAt: new Date(),
        emailDomain: organizerEmailDomain,
      });
      setAlertMessage("Event created successfully!");
      fetchEvents();
      setActiveTab("upcoming");
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating event:", error);
      setAlertMessage("Error creating event."); 
    }
  };

  // Hander for deleting the events and removing it from firestore database
  const deleteEvent = async (eventId, imageUrl) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      setAlertMessage("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      setAlertMessage("Error deleting event.")
    }
  };

  const toggleRegisteredUsers = (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
    } else {
      fetchRegisteredUsers(eventId);
      setSelectedEvent(eventId);
    }
  };

  const fetchRegisteredUsers = async (eventId) => {
    const registrationsRef = collection(db, "registrations");
    const registeredUsersQuery = query(registrationsRef, where("eventId", "==", eventId));
    const registrationsSnapshot = await getDocs(registeredUsersQuery);
  
    const usersData = [];
  
    for (const registrationDoc of registrationsSnapshot.docs) {
      const { displayName } = registrationDoc.data();
      console.log("Fetching email for participant with name:", displayName);
  
      const participantsRef = collection(db, "participants");
      const participantQuery = query(participantsRef, where("name", "==", displayName));
      const participantSnapshot = await getDocs(participantQuery);
  
      if (!participantSnapshot.empty) {
        const participantData = participantSnapshot.docs[0].data();
        console.log("Found participant data:", participantData); 
        usersData.push({
          displayName: displayName,
          email: participantData.email,
        });
      } else {
        console.log(`No participant found with name: ${displayName}`);
        usersData.push({ displayName, email: null });
      }
    }
  
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
        {activeTab === "create" && (
          <form className="create-event-form" onSubmit={handleSubmit}>
            <input type="text" name="title" placeholder="Event Title" onChange={handleInputChange} required />
            <textarea name="description" placeholder="Event Description" onChange={handleInputChange} required />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            <input type="datetime-local" name="date" onChange={handleInputChange} required />
            <button type="submit">Create Event</button>
          </form>
        )}
        {activeTab === "upcoming" && (
          <EventList
            events={upcomingEvents}
            onDelete={deleteEvent}
            onToggleRegisteredUsers={toggleRegisteredUsers}
            selectedEvent={selectedEvent}
            registrationCounts={registrationCounts}
          />
        )}
        {activeTab === "past" && (
          <EventList
            events={pastEvents}
            onToggleRegisteredUsers={toggleRegisteredUsers}
            selectedEvent={selectedEvent}
            registrationCounts={registrationCounts}
          />
        )}
        {selectedEvent && (
          <Modal onClose={() => setSelectedEvent(null)} registeredUsers={registeredUsers} />
        )}
      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />} 
    </div>
  );
}

function EventList({ events, onDelete, onToggleRegisteredUsers, selectedEvent, registrationCounts }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-item">
          {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-item__image" />}
          <h4>{event.title}</h4>
          <p>{event.description}</p>
          <p>{new Date(event.date.seconds * 1000).toLocaleString()}</p>
          <p>Total Registered: {registrationCounts[event.id] || 0}</p> 
          <button onClick={() => onToggleRegisteredUsers(event.id)}>
            {selectedEvent === event.id ? "Close" : "See Registered Users"}
          </button>
          <FaTrash className="event-item__delete-icon" onClick={() => onDelete(event.id, event.imageUrl)} />
        </div>
      ))}
    </div>
  );
}

function Modal({ onClose, registeredUsers }) {
  const emailRecipients = registeredUsers
    .filter((user) => user.email) 
    .map((user) => encodeURIComponent(user.email)) 
    .join(",");

  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailRecipients}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <FaEnvelope
          className="email-icon"
          onClick={() => window.open(gmailLink, "_blank")}
        />
        <button className="close-button" onClick={onClose}>Close</button>
        <h3>Registered Users</h3>
        <ul className="registered-users-list">
          {registeredUsers.length > 0 ? (
            registeredUsers.map((user, index) => (
              <li key={index}>{user.displayName}</li>
            ))
          ) : (
            <li>No registered users.</li>
          )}
        </ul>
      
      </div>
    </div>
  );
}




export default OrganizerDashboard;
