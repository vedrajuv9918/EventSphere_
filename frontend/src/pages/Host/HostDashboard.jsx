import React, { useEffect, useMemo, useState } from "react";
import "./hostDashboard.css";
import { HostService } from "../../services/hostService";
import { UserService } from "../../services/userService";
import { UploadService } from "../../services/uploadService";

const initialForm = {
  title: "",
  description: "",
  posterUrl: "",
  date: "",
  registrationDeadline: "",
  category: "",
  venue: "",
  maxAttendees: "",
  ticketPrice: "",
  maxTicketsPerUser: "1",
  allowCancellation: true,
  eventType: "individual",
};

export default function HostDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    try {
      setLoading(true);
      const [profile, myEvents] = await Promise.all([UserService.me(), HostService.myEvents()]);
      setUser(profile);
      setEvents(myEvents);
    } catch (err) {
      console.error("Host dashboard error", err);
      setError("Unable to load host dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const upcomingActive = events.filter((evt) => {
      if (!evt) return false;
      const eventDate = evt.date ? new Date(evt.date) : null;
      const future = eventDate ? eventDate > new Date() : true;
      return evt.isActive && future && evt.status !== "rejected";
    }).length;

    const totalRegistrations = events.reduce(
      (sum, evt) =>
        sum + (evt.analytics?.totalRegistrations ?? evt.currentAttendees ?? 0),
      0
    );
    const ticketsSold = events.reduce(
      (sum, evt) => sum + (evt.analytics?.totalTickets ?? evt.currentAttendees ?? 0),
      0
    );

    return [
      { label: "Total Events", value: totalEvents, icon: "📅" },
      { label: "Active / Upcoming", value: upcomingActive, icon: "📈" },
      { label: "Total Registrations", value: totalRegistrations, icon: "👥" },
      { label: "Tickets Sold", value: ticketsSold, icon: "🎟" },
    ];
  }, [events]);

  function formatDateTime(date) {
    if (!date) return "Date TBD";
    return new Date(date).toLocaleString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  function seatsLeft(event) {
    if (!event?.maxAttendees) return "Unlimited";
    const left = event.maxAttendees - (event.currentAttendees || 0);
    return left < 0 ? 0 : left;
  }

  function registrationCount(event) {
    return event?.currentAttendees || 0;
  }

  function statusChip(event) {
    const status = event?.status || "pending";
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return { label, className: status };
  }

  async function handleExportCSV(event) {
    try {
      const csv = await HostService.exportRegistrations(event._id);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title}-registrations.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Export CSV failed", err);
      setActionMessage("Unable to export CSV right now.");
    }
  }

  function openCreateModal() {
    setForm(initialForm);
    setActionMessage("");
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;
    setShowModal(false);
  }

  function handleFieldChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handlePosterChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster(true);
      const { url } = await UploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, posterUrl: url }));
    } catch (err) {
      console.error("Poster upload failed", err);
      setActionMessage("Failed to upload poster. Try again.");
    } finally {
      setUploadingPoster(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date ? new Date(form.date) : null,
      registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
      category: form.category,
      venue: form.venue,
      maxAttendees: Number(form.maxAttendees) || 0,
      ticketPrice: Number(form.ticketPrice) || 0,
      teamLimit: Number(form.maxTicketsPerUser) || 1,
      oneSeatPerUser: Number(form.maxTicketsPerUser) === 1,
      allowCancellation: form.allowCancellation,
      type: form.eventType,
      imageUrl: form.posterUrl,
      posterUrl: form.posterUrl,
    };

    try {
      await HostService.createEvent(payload);
      await refreshData();
      setActionMessage("Event submitted for review!");
      setShowModal(false);
    } catch (err) {
      console.error("Create event error", err);
      setActionMessage(err.message || "Unable to create event right now.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return null;

  return (
    <div className="host-page">
      <div className="host-shell">
        <header className="host-hero">
          <div>
            <p className="eyebrow">Host Dashboard</p>
            <h1>Manage your events, {user.name?.split(" ")[0] || "host"}!</h1>
            <p className="subtitle">Keep track of your live registrations and performance.</p>
          </div>
          <button type="button" className="primary ghost" onClick={openCreateModal}>
            + Create New Event
          </button>
        </header>

        <section className="host-metrics-grid">
          {metrics.map((metric) => (
            <article className="host-metric-card" key={metric.label}>
              <div className="metric-icon">{metric.icon}</div>
              <p className="metric-label">{metric.label}</p>
              <h3>{metric.value}</h3>
            </article>
          ))}
        </section>

        <section className="host-events-card">
          <header className="panel-header">
            <div>
              <h2>Your Events</h2>
              <p>Manage and view your hosted events</p>
            </div>
            <button type="button" className="ghost-btn" onClick={openCreateModal}>
              + Create Event
            </button>
          </header>

          {events.length === 0 ? (
            <p className="empty-message">You haven’t created any events yet.</p>
          ) : (
            <div className="host-event-list">
              {events.map((event) => {
                const status = statusChip(event);
                const revenue =
                  (event.analytics?.totalTickets || 0) * (event.ticketPrice || 0);

                return (
                  <article className="host-event-card" key={event._id}>
                    <div className="event-head">
                      <div>
                        <h3>{event.title}</h3>
                        <div className="chip-row">
                          <span className={`status-chip ${status.className}`}>
                            {status.label}
                          </span>
                          <span className="status-chip ghost">
                            {event.date && new Date(event.date) > new Date()
                              ? "Upcoming"
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                      <div className="price-tag">
                        ₹{Number(event.ticketPrice || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="event-meta">
                      <p>
                        <span>📅</span> {formatDateTime(event.date)}
                      </p>
                      <p>
                        <span>👥</span> {registrationCount(event)} /{" "}
                        {event.maxAttendees || "∞"} registered
                      </p>
                      <p>
                        <span>🏷</span> {event.category || "General"}
                      </p>
                    </div>

                    <div className="event-stats-row">
                      <div>
                        <p className="label">Live Registrations</p>
                        <h4>{registrationCount(event)}</h4>
                      </div>
                      <div>
                        <p className="label">Remaining Seats</p>
                        <h4>{seatsLeft(event)}</h4>
                      </div>
                      <div>
                        <p className="label">Tickets Sold</p>
                        <h4>{event.analytics?.totalTickets ?? registrationCount(event)}</h4>
                      </div>
                      <div>
                        <p className="label">Revenue</p>
                        <h4>₹{revenue.toLocaleString()}</h4>
                      </div>
                    </div>

                    <div className="event-actions">
                      <button
                        type="button"
                        onClick={() =>
                          (window.location.href = `/host/event/${event._id}/registrations`)
                        }
                      >
                        View Attendees
                      </button>
                      <button type="button" onClick={() => handleExportCSV(event)}>
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => (window.location.href = `/event/${event._id}`)}
                      >
                        Preview Event
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          (window.location.href = `/host/event/${event._id}/settings`)
                        }
                      >
                        Settings
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>Create New Event</h2>
              <p>Fill in the details to create a new event</p>
            </header>

            <form className="create-form" onSubmit={handleCreateEvent}>
              <label>
                <span>Event Title</span>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleFieldChange}
                  required
                ></textarea>
              </label>

              <label className="file-input">
                <span>Event Banner/Poster</span>
                <div className="file-row">
                  <input type="file" accept="image/*" onChange={handlePosterChange} />
                  <button type="button" className="ghost-btn">
                    {uploadingPoster ? "Uploading..." : "Upload"}
                  </button>
                </div>
                {form.posterUrl && <small>Uploaded ✔</small>}
              </label>

              <div className="grid two">
                <label>
                  <span>Event Date &amp; Time</span>
                  <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleFieldChange}
                    required
                  />
                </label>
                <label>
                  <span>Registration Deadline</span>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={form.registrationDeadline}
                    onChange={handleFieldChange}
                  />
                </label>
              </div>

              <div className="grid two">
                <label>
                  <span>Category</span>
                  <input
                    type="text"
                    name="category"
                    placeholder="Technology, Business..."
                    value={form.category}
                    onChange={handleFieldChange}
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    name="venue"
                    placeholder="Convention Center, City"
                    value={form.venue}
                    onChange={handleFieldChange}
                  />
                </label>
              </div>

              <div className="grid three">
                <label>
                  <span>Max Attendees</span>
                  <input
                    type="number"
                    name="maxAttendees"
                    min="1"
                    value={form.maxAttendees}
                    onChange={handleFieldChange}
                  />
                </label>
                <label>
                  <span>Price (₹)</span>
                  <input
                    type="number"
                    name="ticketPrice"
                    min="0"
                    value={form.ticketPrice}
                    onChange={handleFieldChange}
                  />
                </label>
                <label>
                  <span>Max Tickets/User</span>
                  <input
                    type="number"
                    name="maxTicketsPerUser"
                    min="1"
                    value={form.maxTicketsPerUser}
                    onChange={handleFieldChange}
                  />
                </label>
              </div>

              <label className="toggle-row">
                <span>Allow attendees to cancel registration</span>
                <input
                  type="checkbox"
                  name="allowCancellation"
                  checked={form.allowCancellation}
                  onChange={handleFieldChange}
                />
              </label>

              <label>
                <span>Event Type</span>
                <select
                  name="eventType"
                  value={form.eventType}
                  onChange={handleFieldChange}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </label>

              {actionMessage && <p className="form-message">{actionMessage}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
