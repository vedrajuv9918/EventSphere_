import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AttendeeService } from "../../services/attendeeService";
import "./attendeeDashboard.css";

const recommendedEvents = [
  {
    title: "AI & Machine Learning Conference",
    date: "March 28, 2024",
    reason: "Based on your Technology interest",
  },
  {
    title: "Startup Pitch Night",
    date: "March 22, 2024",
    reason: "Popular in Business category",
  },
];

function formatDate(dateString) {
  if (!dateString) return "Date TBA";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("my-events");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [profile, registrations] = await Promise.all([
          AttendeeService.myProfile(),
          AttendeeService.myRegistrations(),
        ]);
        setUser(profile);
        setRegisteredEvents(Array.isArray(registrations) ? registrations : []);
      } catch (err) {
        console.error("Failed to load attendee dashboard", err);
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const upcoming = registeredEvents.filter((reg) => {
      const eventDate = reg.event?.date ? new Date(reg.event.date) : null;
      return eventDate && eventDate >= new Date();
    }).length;
    const completed = registeredEvents.length - upcoming;
    return {
      total: registeredEvents.length,
      upcoming,
      completed,
    };
  }, [registeredEvents]);

  function badgeForEvent(reg) {
    const eventDate = reg.event?.date ? new Date(reg.event.date) : null;
    if (eventDate && eventDate < new Date()) {
      return { label: "Completed", className: "status-badge muted" };
    }
    return { label: "Upcoming", className: "status-badge success" };
  }

  if (loading) {
    return <p className="loading">Loading your dashboard...</p>;
  }

  if (!user) {
    return (
      <div className="empty-state">
        <p>{error || "Unable to load profile details."}</p>
      </div>
    );
  }

  return (
    <div className="attendee-dashboard">
      <header className="dashboard-hero">
        <div className="hero-copy">
          <p className="eyebrow">Attendee Dashboard</p>
          <h1>Welcome back, {user.name?.split(" ")[0] || "Guest"}!</h1>
          <p className="subtitle">Track your registrations, tickets, and recommendations.</p>
        </div>
        <div className="hero-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate("/events")}>
            Browse Events
          </button>
          <button type="button" className="profile-chip" onClick={() => navigate("/profile")}>
            <img src={user.profilePic || "/default-avatar.png"} alt="Profile avatar" />
            <span>{user.name || "Complete profile"}</span>
          </button>
        </div>
      </header>

      <section className="stats-grid" aria-label="Registration stats">
        <div className="stat-card">
          <p className="stat-label">Total Registrations</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming Events</p>
          <p className="stat-value">{stats.upcoming}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Completed Events</p>
          <p className="stat-value">{stats.completed}</p>
        </div>
      </section>

      <div className="tab-row" role="tablist" aria-label="Dashboard sections">
        <button
          type="button"
          className={`tab ${activeTab === "my-events" ? "active" : ""}`}
          onClick={() => setActiveTab("my-events")}
          role="tab"
          aria-selected={activeTab === "my-events"}
        >
          My Events
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
          role="tab"
          aria-selected={activeTab === "recommendations"}
        >
          Recommendations
        </button>
      </div>

      {activeTab === "my-events" ? (
        <section className="registered-card">
          <div className="card-header">
            <h2>Registered Events</h2>
            <span>Events you’ve registered for</span>
          </div>
          {error && <p className="error-text">{error}</p>}

          <div className="ticket-list">
            {registeredEvents.length > 0 ? (
              registeredEvents.map((reg) => {
                const event = reg.event || {};
                const badge = badgeForEvent(reg);
                return (
                  <article key={reg._id} className="ticket-row">
                    <div className="ticket-info">
                      <div className="ticket-title">
                        <h3>{event.title || "Untitled event"}</h3>
                        <span className={badge.className}>{badge.label}</span>
                      </div>
                      <p className="ticket-date">{formatDate(event.date)}</p>
                      <p className="ticket-meta">
                        Ticket ID: {reg.ticketId || reg.ticket_id} | Seats: {reg.seats || reg.ticketCount || 1}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ticket-btn"
                      onClick={() => navigate(`/ticket/${reg.ticketId || reg.ticket_id}`)}
                    >
                      View Ticket
                    </button>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">You haven’t registered for any events yet.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="registered-card">
          <div className="card-header">
            <h2>AI-Powered Recommendations</h2>
            <span>Events we think you’ll love</span>
          </div>
          <div className="recommendations">
            {recommendedEvents.map((event) => (
              <article key={event.title} className="recommendation-row">
                <div>
                  <h3>{event.title}</h3>
                  <p className="ticket-date">{event.date}</p>
                  <p className="ticket-meta">{event.reason}</p>
                </div>
                <button
                  type="button"
                  className="ghost-btn small"
                  onClick={() => navigate("/events")}
                >
                  View Details
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
