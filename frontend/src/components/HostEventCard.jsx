import React from "react";
import "./hostEventCard.css";

export default function HostEventCard({ event }) {
  const today = new Date();
  const eventDate = new Date(event.date);
  const status =
    eventDate < today
      ? "Completed"
      : event.adminRejected
      ? "Rejected"
      : event.approved
      ? "Approved"
      : "Pending";

  return (
    <div className="host-event-card">

      {/* Image */}
      <div className="host-event-img-box">
        <img src={event.imageUrl} alt="Event Poster" />
      </div>

      <div className="host-event-info">
        <h3>{event.title}</h3>
        <p className="event-date-host">
          {eventDate.toLocaleDateString()}
        </p>

        <span className={`status-tag ${status.toLowerCase()}`}>
          {status}
        </span>

        <div className="host-event-buttons">
          <button
            className="view-registrations-btn"
            onClick={() =>
              (window.location.href = `/host/event/${event._id}/registrations`)
            }
          >
            View Registrations
          </button>

          <button
            className="event-settings-btn"
            onClick={() =>
              (window.location.href = `/host/event/${event._id}/settings`)
            }
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
