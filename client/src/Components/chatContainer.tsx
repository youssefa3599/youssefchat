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

  const apiUrl = process.env.REACT_APP_API_URL;

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
        console.log("📥 [ChatContainer] Fetching messages for:", currentChat._id);
        const res = await axios.get(
          `${apiUrl}/api/messages/${currentUser._id}/${currentChat._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("📦 [ChatContainer] Axios response:", res.data);
        const mapped = res.data.map((msg: any) => ({
          fromSelf: msg.from === currentUser._id,
          message: msg.message,
        }));
        console.log("🧠 [ChatContainer] Setting mapped messages:", mapped);
        setMessages(mapped);
      } catch (err) {
        console.error("❌ [ChatContainer] Error fetching messages:", err);
      }
    };

    console.log("🌀 [ChatContainer] useEffect triggered: Fetching messages");
    fetchMessages();
  }, [currentChat, token, currentUser]);

  // 🟣 Socket listener for incoming messages
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ [Socket] Socket not connected");
      return;
    }

    const handleReceiveMessage = (msg: string, fromId: string) => {
      console.log("📡 [Socket] Received message:", { msg, fromId });
      const chatId = currentChat?._id?.toString();
      console.log("📛 [Socket] Current chat ID:", chatId);

      if (!chatId) {
        console.warn("⚠️ [Arrival] currentChat._id missing. Scheduling retry...");
        setTimeout(() => {
          if (currentChat?._id?.toString() === fromId) {
            console.log("✅ [Retry] Chat matched. Adding delayed message.");
            setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
          } else {
            console.warn("🚫 [Retry] Chat mismatch. Message ignored.");
          }
        }, 500);
      } else if (fromId === chatId) {
        console.log("✅ [Arrival] Message matched current chat. Updating UI.");
        setMessages((prev) => {
          const updated = [...prev, { fromSelf: false, message: msg }];
          console.log("📨 [ChatContainer] Updated messages state:", updated);
          return updated;
        });
      } else {
        console.log("🟠 [Arrival] Message for other chat. Ignored.");
      }
    };

    console.log("🔌 [Socket] Setting up 'msg-receive' listener");
    socket.on("msg-receive", handleReceiveMessage);

    return () => {
      console.log("🧹 [Socket] Cleaning up 'msg-receive' listener");
      socket.off("msg-receive", handleReceiveMessage);
    };
  }, [socket, currentChat]);

  // 🟩 Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      console.log("🔽 [AutoScroll] Scrolling to bottom");
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 🟢 Handle sending message
  const sendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser || !currentChat || !token) {
      console.warn("⚠️ [SendMessage] Incomplete data", {
        newMessage,
        currentUser,
        currentChat,
        token,
      });
      return;
    }

    const messageData = {
      from: currentUser._id,
      to: currentChat._id,
      message: newMessage,
    };

    try {
      console.log("📤 [ChatContainer] Sending message:", messageData);
      await axios.post(`${apiUrl}/api/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 [Socket] Emitting message:", {
        to: currentChat._id,
        msg: newMessage,
      });
      socket.emit("send-msg", {
        to: currentChat._id,
        msg: newMessage,
      });

      setMessages((prev) => {
        const updated = [...prev, { fromSelf: true, message: newMessage }];
        console.log("✅ [ChatContainer] Message sent. Updated messages state:", updated);
        return updated;
      });

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
        {messages.map((msg, index) => {
          console.log("🎨 [Render] Message", index, ":", msg);
          return (
            <div
              key={index}
              className={`message ${msg.fromSelf ? "sent" : "received"}`}
            >
              <div className="content">
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
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
