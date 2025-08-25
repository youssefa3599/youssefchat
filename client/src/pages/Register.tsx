// src/pages/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";


interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}
const apiUrl = process.env.REACT_APP_API_URL;


const Register: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("🟢 Submitting registration:", inputs);
      const res = await axios.post(`${apiUrl}/api/auth/register`, inputs);
      console.log("✅ Registration success:", res.data);
      alert("Registration successful. Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("❌ Registration error:", err);
      alert("Registration failed. Please check your details.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>YoussefChat 📝 Register</h2>
        <input type="text" name="username" placeholder="Username" value={inputs.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={inputs.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={inputs.password} onChange={handleChange} required />
        <button type="submit">Register</button>
        <span onClick={() => navigate("/login")}>Already have an account? Login</span>
      </form>
    </div>
  );
};

export default Register;
