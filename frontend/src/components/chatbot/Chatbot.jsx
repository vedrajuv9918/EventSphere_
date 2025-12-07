import React, { useMemo, useState } from "react";
import "./chatbot.css";
import ChatMessageBubble from "./ChatMessageBubble";

const TOPIC_RESPONSES = {
  "How to register?": `To register for an event:
1. Browse events on the Events page
2. Click on an event card
3. Click 'Register Now'
4. Fill in your details and select number of tickets
5. Complete payment and you'll receive your ticket!`,
  "Login issues": `If you're having trouble logging in:
1. Confirm your email and password are correct
2. Use "Forgot Password" to reset credentials
3. Still stuck? Contact support@eventsphere.com`,
  "Create an event": `Hosts can create events from the Host Dashboard.
Fill out details, upload a poster, and submit for approval.`,
  "Dashboard help": `The dashboard shows registrations, tickets, and analytics.
Switch tabs to view upcoming events or recommendations.`,
  "Cancel registration": `Open your ticket, choose "Cancel Registration" (if enabled), and confirm.
Refunds follow the event’s cancellation policy.`,
  "Team events": `For team events, enter team size within the allowed range and add member details.`,
  "Payment info": `Payments are secured. After completing checkout, your ticket is issued instantly.`,
};

const QUICK_TOPICS = Object.keys(TOPIC_RESPONSES);

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm here to help. Choose a topic below or ask a question." },
  ]);
  const [input, setInput] = useState("");

  const handleSelectTopic = (topic) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: topic },
      { sender: "bot", text: TOPIC_RESPONSES[topic] || "Thanks for asking!" },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    let botReply = "Thanks! A support agent will reach out shortly.";
    if (TOPIC_RESPONSES[userMessage]) {
      botReply = TOPIC_RESPONSES[userMessage];
    }
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }, { sender: "bot", text: botReply }]);
    setInput("");
  };

  const quickTopicButtons = useMemo(
    () =>
      QUICK_TOPICS.map((topic) => (
        <button type="button" key={topic} className="chat-topic-btn" onClick={() => handleSelectTopic(topic)}>
          {topic}
        </button>
      )),
    []
  );

  return (
    <>
      <button
        className="chat-icon bubble"
        aria-label="Open Event Platform help"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <svg viewBox="0 0 64 64" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="chatBubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path
            d="M12 14c0-4.4 3.6-8 8-8h24c4.4 0 8 3.6 8 8v20c0 4.4-3.6 8-8 8H26l-9.5 7.6c-1.3 1-3.1 0-3.1-1.6V14Z"
            fill="url(#chatBubbleGradient)"
          />
          <path
            d="M22 23h20M22 31h12"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="chat-window modern">
          <header className="chat-header modern">
            <div>
              <p className="chat-eyebrow">Event Platform Help</p>
              <h4>Hi! I'm here to help.</h4>
            </div>
            <button className="chat-close" type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="chat-body modern">
            <div className="chat-history">
              {messages.map((msg, idx) => (
                <ChatMessageBubble key={idx} text={msg.text} sender={msg.sender} />
              ))}
            </div>

            <section>
              <p className="chat-section-label">Quick topics:</p>
              <div className="chat-topic-grid">{quickTopicButtons}</div>
            </section>
          </div>

          <footer className="chat-footer modern">
            <input
              placeholder="Type a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button type="button" aria-label="Send message" onClick={handleSend}>
              <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <path d="M4 4l16 8-16 8 4-8-4-8z" fill="#fff" />
              </svg>
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
