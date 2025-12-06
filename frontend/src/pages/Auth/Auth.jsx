import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "../../services/authService";
import "./auth.css";

const intentOptions = [
  { value: "attendee", label: "Attend Events" },
  { value: "host", label: "Host Events" },
];

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    intent: intentOptions[0].value,
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    const qpMode = searchParams.get("mode");
    if (qpMode === "signup") setMode("signup");
    if (qpMode === "login") setMode("login");
  }, [searchParams]);

  useEffect(() => {
    setMessage({ text: "", type: "" });
  }, [mode]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function redirectUser(role) {
    const roleRouteMap = {
      attendee: "/events",
      host: "/host-dashboard",
      admin: "/admin-dashboard",
    };
    navigate(roleRouteMap[role] || "/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setSubmitting(true);

    const payload = isLogin
      ? {
          email: form.email,
          password: form.password,
        }
      : {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.intent,
        };

    try {
      const authAction = isLogin ? AuthService.login : AuthService.register;
      const { ok, data } = await authAction(payload);

      if (!ok) {
        setMessage({
          text: data?.error || "Something went wrong",
          type: "error",
        });
        return;
      }

      setMessage({
        text: data.message || (isLogin ? "Signed in successfully" : "Account created"),
        type: "success",
      });

      const userRole = data.user?.role || form.intent;
      redirectUser(userRole);
    } catch (err) {
      setMessage({
        text: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    navigate(nextMode === "signup" ? "/auth?mode=signup" : "/auth");
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <header className="auth-header">
            <h1>Welcome to EventSphere</h1>
            <p>Sign in to your account or create a new one</p>
          </header>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="auth-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </label>

            {!isLogin && (
              <label className="auth-field">
                <span>I want to</span>
                <select
                  name="intent"
                  value={form.intent}
                  onChange={handleChange}
                >
                  {intentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {message.text && (
            <p className={`form-message ${message.type}`}>{message.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
