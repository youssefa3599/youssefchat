// src/components/Welcome.tsx

import React from "react";
import "../styles/Welcome.css";


const Welcome: React.FC = () => {
  return (
    <div className="welcome-container">
      <h2>Welcome to YoussefChat 👋</h2>
      <p>Select a contact to start chatting.</p>
    </div>
  );
};

export default Welcome;
