import React from "react";
import "./chatbot.css";

export default function ChatMessageBubble({ text, sender }) {
  const isUser = sender === "user";
  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`}>
      {!isUser && (
        <span className="chat-avatar" aria-hidden="true">
          🤖
        </span>
      )}
      <div className={`chat-bubble ${isUser ? "user" : "bot"}`}>{text}</div>
    </div>
  );
}
