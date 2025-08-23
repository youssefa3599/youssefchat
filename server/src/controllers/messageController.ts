import { Request, Response } from 'express';
import Message from '../models/messageModel';

// Send Message Controller with debug logs
export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log('🛠️ [sendMessage] Incoming request body:', req.body);

    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      console.warn('⚠️ [sendMessage] Missing required fields:', { from, to, message });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create and save new message
    const newMessage = await Message.create({ from, to, message });

    console.log('✅ [sendMessage] Message saved:', newMessage);

    return res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('❌ [sendMessage] Server error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get Messages Controller with debug logs
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;
    console.log('🛠️ [getMessages] Params:', { from, to });

    if (!from || !to) {
      console.warn('⚠️ [getMessages] Missing user IDs:', { from, to });
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    // Find messages between users (both directions)
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from }
      ]
    }).sort({ createdAt: 1 });

    console.log(`✅ [getMessages] Found ${messages.length} messages`);

    return res.status(200).json(messages);
  } catch (error) {
    console.error('❌ [getMessages] Server error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
