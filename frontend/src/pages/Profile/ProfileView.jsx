import React from "react";
import "./profileSetup.css";
import defaultAvatar from "../../assets/default-avatar.svg";

export default function ProfileView({ user, onEdit }) {
  if (!user) return null;

  const eventsJoined =
    user.eventsJoined ??
    user.totalRegistrations ??
    user.analytics?.totalRegistrations ??
    user.registrationCount ??
    0;

  return (
    <div className="profile-setup-page">
      <div className="profile-view-card">
        <button type="button" className="close-btn view-edit" onClick={onEdit} aria-label="Edit profile">
          ✎
        </button>

        <img
          src={user.profilePic || defaultAvatar}
          alt={user.name || "Profile"}
          className="profile-view-avatar"
        />

        <div>
          <h1 className="profile-view-name">{user.name || "Guest"}</h1>
          <p className="profile-view-email">{user.email}</p>
        </div>

        <span className="profile-role-chip">{(user.role || "Attendee").replace(/^\w/, (l) => l.toUpperCase())}</span>

        <div className="profile-detail-grid">
          <div>
            <span>Role Type</span>
            <strong>{user.roleType || "—"}</strong>
          </div>
          <div>
            <span>City</span>
            <strong>{user.city || "—"}</strong>
          </div>
          <div>
            <span>Motivation</span>
            <strong>{user.motivation || "—"}</strong>
          </div>
          <div>
            <span>Events Joined</span>
            <strong>{eventsJoined}</strong>
          </div>
        </div>

        <div className="profile-pill-row">
          {user.areaOfInterest && <span className="profile-pill">{user.areaOfInterest}</span>}
          {user.preferredEventType && <span className="profile-pill">{user.preferredEventType}</span>}
        </div>

        <div className="profile-divider" />

        <div className="profile-view-actions">
          <button type="button" onClick={onEdit}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
