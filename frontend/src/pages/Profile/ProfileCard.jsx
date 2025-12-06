import React from "react";
import "./profileCard.css";

export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <img src={user.profilePic} alt="Profile" className="profile-img" />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>{user.roleType}</p>

      <h4>Interests:</h4>
      <div className="interest-list">
        {user.interests.map((i) => (
          <span key={i} className="pill">{i}</span>
        ))}
      </div>
    </div>
  );
}
