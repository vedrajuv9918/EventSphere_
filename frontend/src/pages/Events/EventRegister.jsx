import React, { useEffect, useState } from "react";
import "./eventRegister.css";
import { useParams } from "react-router-dom";

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
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      setEvent(data);
    }
    loadEvent();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
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

    const res = await fetch(`/api/events/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    alert(data.message);
    if (data.ticketId) {
      window.location.href = `/ticket/${data.ticketId}`;
    }
  }

  if (!event) return <p className="loading">Loading...</p>;

  return (
    <div className="register-container">

      <div className="event-summary">
        <img src={event.imageUrl} alt="Event Poster" />
        <h2>{event.title}</h2>
        <p>{new Date(event.date).toLocaleDateString()}</p>

        <p className="capacity">
          Seats Left: <strong>{event.maxAttendees - event.currentAttendees}</strong>
        </p>
      </div>

      <div className="register-card">
        <h3>Complete Your Registration</h3>

        {/* Contact */}
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
        />

        {/* Team or Individual */}
        {event.type === "team" ? (
          <>
            <label>Team Size</label>
            <input
              type="number"
              name="teamSize"
              min="1"
              max={event.teamLimit}
              value={form.teamSize}
              onChange={handleChange}
            />
            <p className="note">Max team size: {event.teamLimit}</p>
          </>
        ) : (
          <>
            <label>Number of Seats</label>
            <input
              type="number"
              name="seats"
              min="1"
              max="5"
              value={form.seats}
              onChange={handleChange}
            />
          </>
        )}

        {/* Special requirements */}
        <textarea
          name="special"
          placeholder="Any special requirements? (Optional)"
          value={form.special}
          onChange={handleChange}
        ></textarea>

        {/* Terms */}
        <label className="terms">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />
          I agree to the terms & conditions.
        </label>

        <h3>Payment Simulation</h3>
        <div className="payment-options">
          <button
            className={`pay-btn ${paymentStatus === "success" ? "active" : ""}`}
            onClick={() => triggerPayment("success")}
          >
            Success
          </button>
          <button
            className={`pay-btn ${paymentStatus === "pending" ? "active" : ""}`}
            onClick={() => triggerPayment("pending")}
          >
            Pending
          </button>
          <button
            className={`pay-btn ${paymentStatus === "failed" ? "active" : ""}`}
            onClick={() => triggerPayment("failed")}
          >
            Failed
          </button>
        </div>

        <button className="submit-btn" onClick={submitRegistration}>
          Confirm Registration
        </button>
      </div>
    </div>
  );
}
