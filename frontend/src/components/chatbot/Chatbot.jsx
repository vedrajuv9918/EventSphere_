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
        <svg viewBox="0 0 32 32" role="presentation" aria-hidden="true">
          <circle cx="16" cy="16" r="16" fill="#464A57" />
          <path
            d="M9.2 13.2c0-3.02 2.448-5.47 5.468-5.47h2.664c3.02 0 5.468 2.45 5.468 5.47v2.2c0 3.02-2.448 5.47-5.468 5.47h-.82l-3 2.38c-.78.62-1.92.05-1.92-.91v-1.46c-1.5-.69-2.39-2.2-2.39-3.87v-2.83Z"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
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
