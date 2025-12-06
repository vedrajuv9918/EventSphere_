import React from "react";
import "./eventCard.css";

export default function EventCard({ event }) {
  const today = new Date();
  const eventDate = new Date(event.date);

  const seatsLeft = event.maxAttendees - event.currentAttendees;

  let status = "Upcoming";
  if (eventDate < today) status = "Completed";
  if (!event.approved && !event.adminRejected) status = "Pending";
  if (event.adminRejected) status = "Rejected";
  if (seatsLeft <= 0) status = "Full";

  return (
    <div
      className="event-card"
      onClick={() => (window.location.href = `/event/${event._id}`)}
    >
      <div className="event-img-box">
        <img src={event.imageUrl} alt="Event Poster" />
      </div>

      <div className="event-info">
        <h3>{event.title}</h3>
        <p className="event-date">
          {eventDate.toLocaleDateString()}
        </p>

        <span className={`status-tag ${status.toLowerCase()}`}>
          {status}
        </span>

        <p className="seats-left">Seats Left: {seatsLeft}</p>
      </div>
    </div>
  );
}
