import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import ChatContainer from "../Components/chatContainer";
import Welcome from "../Components/Welcome";
import Contacts from "../Components/Contacts";

// Instead of hardcoding localhost:
const socketHost = process.env.REACT_APP_API_URL || "http://localhost:5000";


const Chat: React.FC = () => {
  const socket = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  // ✅ Step 1: Load user from localStorage
  useEffect(() => {
    console.log("🔍 [Chat.tsx] Checking localStorage...");
    const storedUser = localStorage.getItem("youssefchat-user");
    const storedToken = localStorage.getItem("youssefchat-token");

    if (!storedUser || storedUser === "undefined") {
      console.warn("⚠️ [Chat.tsx] No valid user. Redirecting...");
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      console.log("✅ [Chat.tsx] Loaded user:", parsedUser);
      setCurrentUser(parsedUser);
      setToken(storedToken);
    } catch (err) {
      console.error("❌ [Chat.tsx] Failed to parse user:", err);
      localStorage.removeItem("youssefchat-user");
      localStorage.removeItem("youssefchat-token");
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Step 2: Setup socket when user is ready
  useEffect(() => {
    if (!currentUser) return;

    console.log("🔌 [Chat.tsx] Connecting to socket server...");

    socket.current = io(socketHost, {
      transports: ["websocket"], // Optional: force WebSocket to avoid polling
    });

    socket.current.on("connect", () => {
      console.log("🟢 [Chat.tsx] Socket connected:", socket.current?.id);
      if (socket.current && currentUser?._id) {
        socket.current.emit("add-user", currentUser._id);
        console.log("📨 [Chat.tsx] Emitted add-user:", currentUser._id);
        setIsSocketReady(true);
      }
    });

    socket.current.on("disconnect", () => {
      console.warn("🔴 [Chat.tsx] Socket disconnected");
      setIsSocketReady(false);
    });

    return () => {
      if (socket.current) {
        console.log("👋 [Chat.tsx] Cleaning up socket...");
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [currentUser]);

  // ✅ Step 3: Handle selecting a contact
  const handleChatSelect = (selected: any) => {
    console.log("💬 [Chat.tsx] Contact selected:", selected);
    setCurrentChat(selected);
  };

  // ✅ Step 4: Render
  return (
    <div className="container">
      {currentUser && (
        <Contacts
          currentUserId={currentUser._id}
          onChatSelect={handleChatSelect}
        />
      )}

      {currentUser ? (
        currentChat === null ? (
          <Welcome />
        ) : (
          <ChatContainer
            currentUser={currentUser}
            currentChat={currentChat}
            socket={socket.current}
            token={token}
          />
        )
      ) : (
        <p>⏳ [Chat.tsx] Loading user...</p>
      )}

      {!isSocketReady && currentUser && (
        <p>⚡ [Chat.tsx] Waiting for socket connection...</p>
      )}
    </div>
  );
};

export default Chat;
