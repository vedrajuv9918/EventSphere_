import React, { useEffect, useState } from "react";
import "./attendeeDashboard.css";

const badgeMap = {
  upcoming: { label: "Upcoming", className: "badge badge-upcoming" },
  completed: { label: "Completed", className: "badge badge-completed" },
};

function statusForEvent(reg) {
  const eventDate = reg.event?.date ? new Date(reg.event.date) : null;
  if (eventDate && eventDate < new Date()) return badgeMap.completed;
  return badgeMap.upcoming;
}

export default function AttendeeDashboard() {
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("my-events");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log("Error loading user", err);
      }
    }

    async function loadRegistrations() {
      try {
        const res = await fetch("/api/events/my-registrations", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        setRegisteredEvents(data);
      } catch (err) {
        console.log("Error loading registrations", err);
      }
    }

    loadUser();
    loadRegistrations();
  }, []);

  if (!user) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="attendee-dashboard">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Attendee Dashboard</p>
          <h1>Welcome back, {user.name?.split(" ")[0]}!</h1>
          <p className="subtitle">Here are the events you’ve registered for</p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => (window.location.href = "/events")}
          >
            Browse Events
          </button>
          <button
            type="button"
            className="profile-chip"
            onClick={() => (window.location.href = "/profile")}
          >
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt="Profile avatar"
            />
            <span>{user.name}</span>
          </button>
        </div>
      </header>

      <div className="tab-row">
          <button
            type="button"
            className={`tab ${activeTab === "my-events" ? "active" : ""}`}
            onClick={() => setActiveTab("my-events")}
          >
            My Events
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendations")}
          >
            Recommendations
          </button>
        </div>

      <section className="registered-card">
        <div className="card-header">
          <h2>Registered Events</h2>
          <span>Events you’ve registered for</span>
        </div>

        <div className="ticket-list">
          {registeredEvents.length > 0 ? (
            registeredEvents.map((reg) => {
              const event = reg.event || {};
              const status = statusForEvent(reg);
              return (
                <article key={reg._id} className="ticket-row">
                  <div className="ticket-info">
                    <div className="ticket-title">
                      <h3>{event.title}</h3>
                      <span className={status.className}>
                        {status.label}
                      </span>
                    </div>
                    <p className="ticket-date">
                      {event.date
                        ? new Date(event.date).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date TBA"}
                    </p>
                    <p className="ticket-meta">
                      Ticket ID: {reg.ticketId} | Seats: {reg.seats || 1}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ticket-btn"
                    onClick={() => (window.location.href = `/ticket/${reg.ticketId}`)}
                  >
                    <span aria-hidden="true">⬇️</span> View Ticket
                  </button>
                </article>
              );
            })
          ) : (
            <p className="empty-state">
              You haven’t registered for any events yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
