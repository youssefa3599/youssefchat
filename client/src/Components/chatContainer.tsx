import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/ChatContainer.css";

interface ChatContainerProps {
  currentChat: any;
  socket: any;
  currentUser: any;
  token: string | null;
}

interface MessageType {
  fromSelf: boolean;
  message: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  currentChat,
  socket,
  currentUser,
  token,
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Environment variable (fixed: safe for Vercel)
  const apiUrl = process.env.REACT_APP_API_URL as string;

  const getColor = (name: string) => {
    const colors = ["#6c63ff", "#f97316", "#10b981", "#ef4444", "#3b82f6"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  // 🟡 Fetch messages between users
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat || !token || !currentUser?._id) {
        console.warn("⚠️ [FetchMessages] Missing data:", {
          currentChat,
          token,
          currentUserId: currentUser?._id,
        });
        return;
      }

      try {
        const res = await axios.get(
          `${apiUrl}/api/messages/${currentUser._id}/${currentChat._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mapped = res.data.map((msg: any) => ({
          fromSelf: msg.from === currentUser._id,
          message: msg.message,
        }));

        setMessages(mapped);
      } catch (err) {
        console.error("❌ [ChatContainer] Error fetching messages:", err);
      }
    };

    fetchMessages();
    // ✅ ignore apiUrl in deps since it's static (env var)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat, token, currentUser]);

  // 🟣 Socket listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: string, fromId: string) => {
      const chatId = currentChat?._id?.toString();

      if (!chatId) {
        setTimeout(() => {
          if (currentChat?._id?.toString() === fromId) {
            setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
          }
        }, 500);
      } else if (fromId === chatId) {
        setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
      }
    };

    socket.on("msg-receive", handleReceiveMessage);
    return () => {
      socket.off("msg-receive", handleReceiveMessage);
    };
  }, [socket, currentChat]);

  // 🟩 Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 🟢 Handle sending message
  const sendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser || !currentChat || !token) {
      return;
    }

    const messageData = {
      from: currentUser._id,
      to: currentChat._id,
      message: newMessage,
    };

    try {
      await axios.post(`${apiUrl}/api/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("send-msg", {
        to: currentChat._id,
        msg: newMessage,
      });

      setMessages((prev) => [...prev, { fromSelf: true, message: newMessage }]);
      setNewMessage("");
    } catch (err) {
      console.error("❌ [ChatContainer] Failed to send message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div
          className="avatar"
          style={{ backgroundColor: getColor(currentChat?.username || "") }}
        >
          {currentChat?.username?.charAt(0).toUpperCase()}
        </div>
        <h3>{currentChat?.username}</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.fromSelf ? "sent" : "received"}`}
          >
            <div className="content">
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatContainer;
