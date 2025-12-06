import React from "react";
import "./chatbot.css";

export default function ChatMessageBubble({ text, sender }) {
  return (
    <div className={`bubble ${sender === "user" ? "user" : "bot"}`}>
      {text}
    </div>
  );
}
