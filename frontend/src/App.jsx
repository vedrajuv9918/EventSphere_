import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/navbar/Navbar";
import Chatbot from "./components/chatbot/Chatbot";

export default function App() {
  return (
    <div>
      <Navbar />
      <AppRoutes />
      <Chatbot />
    </div>
  );
}
