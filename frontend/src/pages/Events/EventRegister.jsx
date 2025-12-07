import React, { useEffect, useState } from "react";
import "./eventRegister.css";
import { useParams } from "react-router-dom";
import { EventService } from "../../services/eventService";

export default function EventRegister() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [form, setForm] = useState({
    contact: "",
    seats: 1,
    teamSize: 1,
    special: "",
    agree: false,
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await EventService.byId(id);
        setEvent(data);
      } catch (err) {
        console.error("Failed to load event", err);
      }
    }
    loadEvent();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function triggerPayment(status) {
    setPaymentStatus(status);
  }

  async function submitRegistration() {
    if (!form.agree) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    if (paymentStatus !== "success") {
      alert("Payment must be successful to continue.");
      return;
    }

    const payload = {
      contact: form.contact,
      seats: event.type === "team" ? form.teamSize : form.seats,
      special: form.special,
      paymentStatus,
    };

    try {
      const data = await EventService.register(id, payload);
      alert(data.message || "Registered successfully");
      if (data.ticketId) {
        window.location.href = `/ticket/${data.ticketId}`;
      }
    } catch (err) {
      alert(err.message || "Registration failed");
    }
  }

  if (!event) return <p className="loading">Loading...</p>;

  const seatsLeft = Math.max(event.maxAttendees - (event.currentAttendees || 0), 0);
  const posterSrc =
    event.posterUrl ||
    event.imageUrl ||
    event.poster ||
    event.banner ||
    event.coverImage ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="register-page">
      <div className="register-shell">
        <header className="register-hero">
          <div className="hero-copy">
            <p className="eyebrow">Register</p>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
          </div>
          <div className="hero-meta">
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span>{event.venue || "Venue TBA"}</span>
            <span>{seatsLeft} seats left</span>
          </div>
        </header>

        <div className="register-grid">
          <article className="event-preview-card">
            <div className="preview-image">
              <img src={posterSrc} alt={event.title} />
              <span className="preview-badge">{event.category || event.type || "General"}</span>
              <span className="preview-price">
                {event.ticketPrice ? `₹${event.ticketPrice}` : "Free"}
              </span>
            </div>
            <div className="preview-body">
              <h2>{event.title}</h2>
              <p className="preview-desc">{event.description}</p>
              <ul>
                <li>
                  <span>📅</span>
                  {new Date(event.date).toLocaleDateString()}
                </li>
                <li>
                  <span>📍</span>
                  {event.venue || "Venue TBA"}
                </li>
                <li>
                  <span>🎟</span>
                  Seats left: {seatsLeft}
                </li>
                <li>
                  <span>👥</span>
                  {event.type === "team" ? "Team Event" : "Individual Event"}
                </li>
              </ul>
            </div>
          </article>

          <section className="register-card">
            <h3>Complete Your Registration</h3>

            <label>
              Contact Number *
              <input
                type="text"
                name="contact"
                placeholder="Enter 10-digit number"
                value={form.contact}
                onChange={handleChange}
              />
            </label>

            {event.type === "team" ? (
              <>
                <label>
                  Team Size
                  <input
                    type="number"
                    name="teamSize"
                    min="1"
                    max={event.teamLimit}
                    value={form.teamSize}
                    onChange={handleChange}
                  />
                </label>
                <p className="note">Max team size: {event.teamLimit}</p>
              </>
            ) : (
              <>
                <label>
                  Number of Tickets
                  <input
                    type="number"
                    name="seats"
                    min="1"
                    max="5"
                    value={form.seats}
                    onChange={handleChange}
                  />
                </label>
              </>
            )}

            <label>
              Special Request (Optional)
              <textarea
                name="special"
                placeholder="Any special requirements or requests..."
                value={form.special}
                onChange={handleChange}
              />
            </label>

            <label className="terms">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              I agree to the Terms & Conditions
            </label>

            <div className="payment-options">
              <button
                type="button"
                className={`pay-btn ${paymentStatus === "success" ? "active" : ""}`}
                onClick={() => triggerPayment("success")}
              >
                Payment Success
              </button>
              <button
                type="button"
                className={`pay-btn ${paymentStatus === "pending" ? "active" : ""}`}
                onClick={() => triggerPayment("pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`pay-btn ${paymentStatus === "failed" ? "active" : ""}`}
                onClick={() => triggerPayment("failed")}
              >
                Failed
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="button" className="submit-btn" onClick={submitRegistration}>
                Confirm Registration
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
