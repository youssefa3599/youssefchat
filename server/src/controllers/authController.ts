import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  console.log("📝 [REGISTER] Request received with body:", req.body);

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("❌ [REGISTER] Email already used:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const userData = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };

    console.log("✅ [REGISTER] New user created:", userData);

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("❌ [REGISTER] Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  console.log("🔐 [LOGIN] Request received with body:", req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ [LOGIN] No user found with email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ [LOGIN] Password does not match for user:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    console.log("✅ [LOGIN] Login successful. User data to return:", userData);

    return res.status(200).json({
      message: "Login route works",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("❌ [LOGIN] Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
