import React, { useEffect, useState } from "react";
import "./eventDetails.css";
import { useParams } from "react-router-dom";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadEvent();
    loadUser();
  }, []);

  async function loadEvent() {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    setEvent(data);
  }

  async function loadUser() {
    const res = await fetch("/api/users/me");
    const data = await res.json();
    setUser(data);
  }

  if (!event) return <p className="loading">Loading event...</p>;

  const seatsLeft = event.maxAttendees - event.currentAttendees;
  const today = new Date();
  const eventDate = new Date(event.date);

  let status = "Upcoming";
  if (eventDate < today) status = "Completed";
  if (event.adminRejected) status = "Rejected";
  if (!event.approved && !event.adminRejected) status = "Pending";
  if (seatsLeft <= 0) status = "Full";

  return (
    <div className="event-details-container">

      {/* Banner and Poster */}
      <div className="event-banner">
        <img src={event.imageUrl} alt="Event Poster" />
      </div>

      {/* Main Details */}
      <div className="event-info-card">
        <h1>{event.title}</h1>

        <span className={`status-badge ${status.toLowerCase()}`}>
          {status}
        </span>

        <p className="event-date">
          📅 {eventDate.toLocaleDateString()}
        </p>

        <p className="event-venue">
          📍 {event.venue || "Venue will be announced"}
        </p>

        <p className="event-seats">
          🎟 Seats Left: <strong>{seatsLeft}</strong>
        </p>

        <p className="event-type">
          {event.type === "team" ? "👥 Team Event" : "🧍 Individual Event"}
        </p>

        {event.type === "team" && (
          <p className="team-info">
            Team Size: <strong>{event.teamLimit} members</strong>
          </p>
        )}

        <h3>Description</h3>
        <p className="event-desc">{event.description}</p>

        {/* Host Info */}
        {event.hostName && (
          <p className="host-info">
            Hosted By: <strong>{event.hostName}</strong>
          </p>
        )}

        {/* Register Button (Only for Attendee) */}
        {user?.role === "attendee" && status === "Upcoming" && seatsLeft > 0 && (
          <button
            className="register-btn"
            onClick={() => (window.location.href = `/register/${event._id}`)}
          >
            Register Now
          </button>
        )}

        {/* If not attendee */}
        {user?.role !== "attendee" && (
          <p className="info-note">
            Only attendees can register for events.
          </p>
        )}
      </div>
    </div>
  );
}
