import { Response } from 'express';
import User from '../models/userModel';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.userId;
    console.log("👤 [GET USERS] Request made by user ID:", currentUserId);

    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');

    console.log("✅ [GET USERS] Found users (excluding self):", users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email
    })));

    res.status(200).json(users);
  } catch (error) {
    console.error('❌ [GET USERS] Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
