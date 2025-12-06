import React, { useEffect, useMemo, useState } from "react";
import "./adminEventCard.css";
import { AdminService } from "../services/adminService";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=60";

export default function AdminEventCard({ event, refresh, readonly }) {
  const [reason, setReason] = useState("");
  const [posterSrc, setPosterSrc] = useState(FALLBACK_POSTER);

  const preferredPoster = useMemo(
    () =>
      event?.posterUrl ||
      event?.imageUrl ||
      event?.poster ||
      event?.banner ||
      event?.coverImage ||
      "",
    [event]
  );

  useEffect(() => {
    setPosterSrc(preferredPoster || FALLBACK_POSTER);
  }, [preferredPoster]);

  const hostRecord = event?.hostId;
  const hostName = hostRecord?.name || event?.hostName || "Host name unavailable";
  const hostEmail = hostRecord?.email;
  const hostPhone = hostRecord?.phone;

  async function approveEvent() {
    try {
      await AdminService.approve(event._id);
      refresh?.();
    } catch (err) {
      console.error("Approve event failed", err);
    }
  }

  async function rejectEvent() {
    try {
      await AdminService.reject(event._id, { reason: reason.trim() });
      refresh?.();
    } catch (err) {
      console.error("Reject event failed", err);
    }
  }

  return (
    <div className="admin-event-card">
      <div className="admin-event-img">
        <img
          src={posterSrc}
          alt={`${event.title} poster`}
          onError={() => setPosterSrc(FALLBACK_POSTER)}
        />
      </div>

      <div className="admin-event-info">
        <h3>{event.title}</h3>
        <p>{event.date ? new Date(event.date).toLocaleDateString() : "Date TBA"}</p>

        <div className="host-details">
          <div className="host-pill">
            <span className="host-label">Host</span>
            <strong>{hostName}</strong>
          </div>

          {(hostEmail || hostPhone) && (
            <div className="host-contact">
              {hostEmail && (
                <a href={`mailto:${hostEmail}`} className="host-contact-item">
                  {hostEmail}
                </a>
              )}
              {hostPhone && (
                <a href={`tel:${hostPhone}`} className="host-contact-item">
                  {hostPhone}
                </a>
              )}
            </div>
          )}
        </div>

        <p className="admin-status">
          Status:{" "}
          <strong>
            {event.approved ? "Approved" : event.adminRejected ? "Rejected" : "Pending"}
          </strong>
        </p>

        {event.adminRejected && (
          <p className="reject-msg">Reason: {event.rejectReason}</p>
        )}

        {!readonly && (
          <div className="admin-buttons">
            <button className="approve-btn" onClick={approveEvent}>
              Approve
            </button>

            <input
              type="text"
              placeholder="Rejection Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button className="reject-btn" onClick={rejectEvent}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
