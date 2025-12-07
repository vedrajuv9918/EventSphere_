import React, { useEffect, useRef, useState } from "react";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = Boolean(token);
  const role = user?.role;
  const hideBrowseButton = role === "host" || role === "admin";
  const avatarSrc = user?.profilePic || "";
  const avatarInitial = (user?.name || "EventSphere")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "E";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getDashboardRoute(role) {
    switch (role) {
      case "host":
        return "/host-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/attendee-dashboard";
    }
  }

  function handleProtectedNav(path) {
    if (!path) return;
    const hasToken = localStorage.getItem("token");
    if (!hasToken) {
      navigate("/auth");
      return;
    }
    navigate(path);
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="nav-shell">
      <nav className="nav">
        <Link to="/" className="logo" aria-label="EventSphere home">
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="presentation">
              <rect x="4" y="7" width="24" height="21" rx="6" />
              <path d="M9 4v6M23 4v6" />
              <circle cx="12" cy="17" r="1.6" />
              <circle cx="20" cy="17" r="1.6" />
              <circle cx="12" cy="23" r="1.6" />
              <circle cx="20" cy="23" r="1.6" />
            </svg>
          </span>
          <span className="logo-text">EventSphere</span>
        </Link>

        <div className="nav-right">
          {!hideBrowseButton && (
            <button
              className="nav-link ghost"
              type="button"
              onClick={() => handleProtectedNav("/events")}
            >
              Browse Events
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="nav-link outline"
                onClick={() =>
                  handleProtectedNav(getDashboardRoute(user?.role))
                }
              >
                Dashboard
              </button>
              <div className="profile-menu" ref={menuRef}>
                <button
                  type="button"
                  className="avatar-button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile avatar" />
                  ) : (
                    <span className="avatar-fallback" aria-hidden="true">
                      {avatarInitial}
                    </span>
                  )}
                  <span className="chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {menuOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.name || "Guest"}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="dropdown-item danger"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className="nav-link primary"
              type="button"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
