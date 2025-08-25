import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Contacts.css";


const apiUrl = process.env.REACT_APP_API_URL;
interface User {
  _id: string;
  username: string;
  email: string;
}

interface Props {
  currentUserId: string;
  onChatSelect: (contact: User) => void;
}

const Contacts: React.FC<Props> = ({ currentUserId, onChatSelect }) => {
  const [contacts, setContacts] = useState<User[]>([]);

  const getColor = (name: string) => {
    const colors = ["#6c63ff", "#f97316", "#10b981", "#ef4444", "#3b82f6"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem("youssefchat-token");

      if (!token) {
        console.warn("⚠️ [CONTACTS] No token found in localStorage — cannot fetch contacts.");
        // Optionally, redirect to login page here or handle logout
        return;
      }

      console.log("📞 [CONTACTS] Fetching contacts...");
      console.log("🔐 [CONTACTS] Current user ID:", currentUserId);
      console.log("🔐 [CONTACTS] Token from localStorage:", token);

      try {
       const response = await axios.get(`${apiUrl}/api/users`, {
  headers: {
    Authorization: `Bearer ${token}`, // if needed
  },
});

        console.log("✅ [CONTACTS] Users received from backend:", response.data);

        if (Array.isArray(response.data)) {
          const contactIds = response.data.map((u: any) => u._id);
          console.log("👥 [CONTACTS] Contact user IDs:", contactIds);
        } else {
          console.warn("⚠️ [CONTACTS] Unexpected response format:", response.data);
        }

        setContacts(response.data);
      } catch (err) {
        console.error("❌ [CONTACTS] Failed to load contacts:", err);
      }
    };

    if (currentUserId) {
      console.log("🔁 [CONTACTS] currentUserId detected, calling fetchContacts...");
      fetchContacts();
    } else {
      console.warn("⚠️ [CONTACTS] No currentUserId — skipping fetch");
    }
  }, [currentUserId]);

  return (
    <div className="contacts-container">
      <h3>Contacts</h3>
      <ul className="contacts-list">
        {contacts.map((contact) => (
          <li
            key={contact._id}
            onClick={() => {
              console.log("🖱️ [CONTACTS] User clicked:", contact);
              onChatSelect(contact);
            }}
            className="contact"
          >
            <div
              className="avatar"
              style={{ backgroundColor: getColor(contact.username) }}
            >
              {contact.username[0].toUpperCase()}
            </div>
            <div className="username">{contact.username}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;
