import React, { useState, useEffect, useMemo } from "react";
import { UserService } from "../../services/userService";
import "./profileSetup.css";
import ProfileView from "./ProfileView";

const STEPS = [
  {
    id: "roleType",
    label: "Are you a Student or Working Professional?",
    options: ["Student", "Working Professional", "Freelancer", "Entrepreneur"],
  },
  {
    id: "areaOfInterest",
    label: "What's your area of interest?",
    options: ["Technology", "Business", "Entertainment", "Sports", "Arts & Culture", "Education"],
  },
  {
    id: "preferredEventType",
    label: "What type of events do you prefer?",
    options: ["Workshop", "Webinar", "Fest", "Competition", "Networking", "Conference"],
  },
  {
    id: "motivation",
    label: "What motivates you to attend events?",
    options: ["Learning", "Networking", "Entertainment", "Career Growth", "Community", "Personal Development"],
  },
  {
    id: "city",
    label: "Which city are you from?",
    type: "input",
    placeholder: "Enter your city",
  },
  {
    id: "profilePic",
    label: "Upload your profile picture (optional)",
    type: "upload",
  },
];

const INITIAL_FORM = {
  roleType: "",
  areaOfInterest: "",
  preferredEventType: "",
  motivation: "",
  city: "",
  profilePic: "",
};

export default function ProfileSetup() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await UserService.me();
        setUser(data);
        setForm({
          roleType: data.roleType || "",
          areaOfInterest: data.areaOfInterest || "",
          preferredEventType: data.preferredEventType || "",
          motivation: data.motivation || "",
          city: data.city || "",
          profilePic: data.profilePic || "",
        });
        setEditing(!data.profileCompleted);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const currentStep = useMemo(() => STEPS[step], [step]);
  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  function handleSelect(value) {
    setForm((prev) => ({ ...prev, [currentStep.id]: value }));
  }

  function handleInputChange(e) {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [currentStep.id]: value }));
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await UserService.uploadProfilePhoto(file);
      const url = response?.url || response?.imageUrl;
      if (url) {
        setForm((prev) => ({ ...prev, profilePic: url }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function canProceed() {
    if (currentStep.type === "upload") {
      return true;
    }
    if (currentStep.type === "input") {
      return Boolean(form[currentStep.id]?.trim());
    }
    return Boolean(form[currentStep.id]);
  }

  function handleNext() {
    if (!canProceed()) return;
    if (!isLastStep) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (!isFirstStep) {
      setStep((prev) => prev - 1);
    }
  }

  async function handleFinish() {
    if (!canProceed()) return;
    try {
      setSaving(true);
      const payload = {
        ...form,
        profileCompleted: true,
      };
      const data = await UserService.updateProfile(payload);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify({ ...(JSON.parse(localStorage.getItem("user") || "{}")), ...data.user }));
      setEditing(false);
    } catch (err) {
      console.error("Profile save failed:", err);
      alert(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const showProfileView = !editing && user?.profileCompleted;

  if (loading) {
    return <div className="profile-setup-loading">Loading profile...</div>;
  }

  if (showProfileView) {
    return (
      <ProfileView
        user={user}
        onEdit={() => {
          setEditing(true);
          setStep(0);
        }}
      />
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="setup-shell">
        <div className="setup-card">
          <header className="setup-header">
            <div>
              <p className="eyebrow">Setup Your Profile</p>
              <h1>{currentStep.label}</h1>
            </div>
            {user?.profileCompleted && (
              <button className="close-btn" onClick={() => setEditing(false)} aria-label="Close">
                ×
              </button>
            )}
          </header>

          <div className="step-meta">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <div className="step-indicator">
              {STEPS.map((_, index) => (
                <span key={_.id || index} className={index <= step ? "active" : ""} />
              ))}
            </div>
          </div>

          <div className="step-body">
            {currentStep.type === "input" && (
              <input
                type="text"
                placeholder={currentStep.placeholder}
                value={form[currentStep.id] || ""}
                onChange={handleInputChange}
              />
            )}

            {currentStep.type === "upload" && (
              <div className="upload-panel">
                <div className="upload-circle">
                  {form.profilePic ? (
                    <img src={form.profilePic} alt="Profile preview" />
                  ) : (
                    <span>&uarr;</span>
                  )}
                </div>
                <label className="upload-btn">
                  {uploading ? "Uploading..." : form.profilePic ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            )}

            {!currentStep.type && (
              <div className="option-grid">
                {currentStep.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`option-btn ${form[currentStep.id] === option ? "selected" : ""}`}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <footer className="step-footer">
            <button type="button" className="ghost-nav" onClick={handleBack} disabled={isFirstStep}>
              Back
            </button>
            <button
              type="button"
              className="primary-nav"
              onClick={isLastStep ? handleFinish : handleNext}
              disabled={!canProceed() || saving}
            >
              {isLastStep ? (saving ? "Saving..." : "Finish") : "Next"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
