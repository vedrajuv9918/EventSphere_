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
      setEvents(Array.isArray(myEvents) ? myEvents : []);
    } catch (err) {
      console.error("Host dashboard error", err);
      setError("Unable to load host dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const activeUpcoming = events.filter((evt) => {
      if (!evt) return false;
      const eventDate = evt.date ? new Date(evt.date) : null;
      const future = eventDate ? eventDate > new Date() : true;
      return (evt.isActive || evt.status === "approved") && future;
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
      { label: "Total Events", value: totalEvents, icon: "calendar" },
      { label: "Active/Upcoming", value: activeUpcoming, icon: "trending" },
      { label: "Total Registrations", value: totalRegistrations, icon: "users" },
      { label: "Tickets Sold", value: ticketsSold, icon: "ticket" },
    ];
  }, [events]);

  function formatDateTime(date) {
    if (!date) return "Date TBA";
    return new Date(date).toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  function registrationCount(event) {
    return event?.currentAttendees || 0;
  }

  function seatsLeft(event) {
    if (!event?.maxAttendees) return "Unlimited";
    const left = event.maxAttendees - registrationCount(event);
    return left < 0 ? 0 : left;
  }

  function ticketCount(event) {
    return event.analytics?.totalTickets ?? registrationCount(event);
  }

  function currency(amount) {
    return `₹${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function approvalChip(event) {
    const status = (event?.status || event?.approvalStatus || "pending").toLowerCase();
    if (status === "approved") return { label: "Approved", tone: "success" };
    if (status === "rejected") return { label: "Rejected", tone: "danger" };
    if (status === "pending") return { label: "Pending", tone: "neutral" };
    return { label: status.charAt(0).toUpperCase() + status.slice(1), tone: "neutral" };
  }

  function scheduleChip(event) {
    if (event.date && new Date(event.date) < new Date()) {
      return { label: "Completed", tone: "ghost" };
    }
    return { label: "Upcoming", tone: "ghost" };
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
    <div className="host-dashboard">
      <div className="host-dashboard__shell">
        <header className="host-dashboard__hero">
          <div>
            <p className="eyebrow">Host Dashboard</p>
            <h1>Host Dashboard</h1>
            <p className="subtitle">Manage your events, {user.name?.split(" ")[0] || "host"}!</p>
          </div>
          <button type="button" className="btn primary" onClick={openCreateModal}>
            + Create New Event
          </button>
        </header>

        <section className="host-dashboard__stats">
          {stats.map((stat) => (
            <article className="host-stat-card" key={stat.label}>
              <span className={`stat-icon ${stat.icon}`} aria-hidden="true" />
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="host-events-panel">
          <header className="host-panel__header">
            <div>
              <h2>Your Events</h2>
              <p>Manage and view your hosted events</p>
            </div>
            <button type="button" className="btn ghost" onClick={openCreateModal}>
              + Create Event
            </button>
          </header>

          {events.length === 0 ? (
            <p className="empty-message">You haven’t created any events yet.</p>
          ) : (
            <div className="host-event-list">
              {events.map((event) => {
                const approval = approvalChip(event);
                const schedule = scheduleChip(event);
                const revenue = (event.ticketPrice || 0) * ticketCount(event);
                const attendees = registrationCount(event);

                const disableAttendeeActions = attendees === 0;

                return (
                  <article className="host-event" key={event._id}>
                    <div className="host-event__top">
                      <div>
                        <h3>{event.title}</h3>
                        <div className="badge-row">
                          <span className={`chip ${approval.tone}`}>{approval.label}</span>
                          <span className={`chip ${schedule.tone}`}>{schedule.label}</span>
                        </div>
                      </div>
                      <div className="ticket-price">{currency(event.ticketPrice)}</div>
                    </div>

                    <div className="host-event__meta">
                      <p>
                        <span aria-hidden="true">📅</span> {formatDateTime(event.date)}
                      </p>
                      <p>
                        <span aria-hidden="true">👥</span> {attendees} /{" "}
                        {event.maxAttendees || "∞"} registered
                      </p>
                      <p>
                        <span aria-hidden="true">🏷</span> {event.category || "General"}
                      </p>
                    </div>

                    <div className="host-event__stats">
                      <div>
                        <p>Live Registration</p>
                        <strong>{attendees}</strong>
                      </div>
                      <div>
                        <p>Remaining Seats</p>
                        <strong>{seatsLeft(event)}</strong>
                      </div>
                      <div>
                        <p>Tickets Sold</p>
                        <strong>{ticketCount(event)}</strong>
                      </div>
                      <div>
                        <p>Revenue</p>
                        <strong>{currency(revenue)}</strong>
                      </div>
                    </div>

                    <div className="host-event__actions">
                      <button
                        type="button"
                        disabled={disableAttendeeActions}
                        onClick={() =>
                          (window.location.href = `/host/event/${event._id}/registrations`)
                        }
                      >
                        View Attendees ({attendees})
                      </button>
                      <button type="button" disabled={disableAttendeeActions} onClick={() => handleExportCSV(event)}>
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => (window.location.href = `/event/${event._id}`)}
                      >
                        Preview Ticket
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
