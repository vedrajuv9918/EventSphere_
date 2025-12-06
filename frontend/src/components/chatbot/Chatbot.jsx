import React, { useState } from "react";
import "./chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="chat-icon"
        aria-label="Open EventSphere assistant"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="chat-icon-glow" aria-hidden="true"></span>
        <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="agenticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#agenticGradient)" />
          <path
            d="M16 20h16M16 26h10"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="26" r="1.8" fill="#fff" />
        </svg>
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">Event Assistant</div>
          <div className="chat-body">
            <div className="chat-bubble bot">Hi! How can I help you?</div>
          </div>
          <div className="chat-footer">
            <input placeholder="Type a message..." />
            <button type="button">Send</button>
          </div>
        </div>
      )}
    </>
  );
}
