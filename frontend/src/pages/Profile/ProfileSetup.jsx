import React, { useState, useEffect } from "react";
import "./profileSetup.css";

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    roleType: "", // student / worker
    interests: [],
    profilePic: ""
  });

  const interestOptions = [
    "Music", "Sports", "Technology", "Workshops",
    "Festivals", "Hackathons", "Seminars", "Gaming", "Cultural Events"
  ];

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        setUser(data);

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          roleType: data.roleType || "",
          interests: data.interests || [],
          profilePic: data.profilePic || ""
        });
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    }
    loadUser();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleInterest(item) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((x) => x !== item)
        : [...prev.interests, item]
    }));
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profilePic", file);

    const res = await fetch("/api/users/upload-profile-pic", {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    setForm({ ...form, profilePic: data.url });
  }

  async function saveProfile() {
    const res = await fetch("/api/users/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    alert(data.message);
    window.location.href = "/";
  }

  if (!user) return <p className="loading">Loading...</p>;

  return (
    <div className="profile-setup-container">
      <div className={`step-card step-${step}`}>
        
        {/* STEP 1 - Basic Info */}
        {step === 1 && (
          <div className="step-content">
            <h2>Basic Information</h2>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
            />

            <label className="role-label">You are a:</label>
            <div className="role-options">
              <button
                className={`role-btn ${form.roleType === "student" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, roleType: "student" })}
              >
                Student
              </button>

              <button
                className={`role-btn ${form.roleType === "worker" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, roleType: "worker" })}
              >
                Worker
              </button>
            </div>

            <button className="next-btn" onClick={() => setStep(2)}>Next</button>
          </div>
        )}

        {/* STEP 2 - Interests */}
        {step === 2 && (
          <div className="step-content">
            <h2>Select Your Interests</h2>

            <div className="interests-grid">
              {interestOptions.map((item) => (
                <span
                  key={item}
                  className={`interest-tag ${
                    form.interests.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(1)}>Back</button>
              <button className="next-btn" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 3 - Profile Picture */}
        {step === 3 && (
          <div className="step-content">
            <h2>Upload Profile Picture</h2>

            <div className="profile-pic-preview">
              <img
                src={form.profilePic || "/default-avatar.png"}
                alt="Preview"
              />
            </div>

            <input type="file" onChange={uploadImage} />

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(2)}>Back</button>
              <button className="next-btn" onClick={() => setStep(4)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 4 - Review & Save */}
        {step === 4 && (
          <div className="step-content">
            <h2>Review Your Profile</h2>

            <div className="review-card">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Phone:</strong> {form.phone}</p>
              <p><strong>Role:</strong> {form.roleType}</p>
              <p><strong>Interests:</strong> {form.interests.join(", ")}</p>

              <img src={form.profilePic || "/default-avatar.png"} alt="Profile" />
            </div>

            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(3)}>Back</button>
              <button className="save-btn" onClick={saveProfile}>Save Profile</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
