import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

interface LoginFormData {
  email: string;
  password: string;
}
const apiUrl = process.env.REACT_APP_API_URL;


const Login: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<LoginFormData>({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("🔐 Attempting login with:", inputs);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, inputs);
      console.log("✅ Login API response:", response.data);

      const { user, token } = response.data;

      if (user && token) {
        localStorage.setItem("youssefchat-token", token);
        localStorage.setItem("youssefchat-user", JSON.stringify(user));

        console.log("💾 Saved to localStorage:");
        console.log("   🔑 Token:", token);
        console.log("   👤 User:", user);

        // 🔁 Wait briefly before navigating to allow storage to settle
        setTimeout(() => {
          navigate("/chat");
        }, 100); // 100ms delay
      } else {
        console.error("❌ Login succeeded but user or token missing in response:", response.data);
        alert("Login failed: Missing user or token in response.");
      }
    } catch (err: any) {
      console.error("❌ Login request failed:", err.response?.data || err.message);
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>YoussefChat 🔐 Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={inputs.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={inputs.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <span onClick={() => navigate("/register")}>
          Don’t have an account? Register
        </span>
      </form>
    </div>
  );
};

export default Login;
