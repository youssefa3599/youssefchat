import { Router, Request, Response, NextFunction } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Middleware to log route hits and auth check
const logRoute = (req: Request, res: Response, next: NextFunction) => {
  console.log(`🔔 [messageRoutes] ${req.method} ${req.originalUrl} - User Authenticated: ${!!req.headers.authorization}`);
  next();
};

router.use(logRoute);

// POST /api/messages - send message
router.post('/', verifyToken, sendMessage);

// GET /api/messages/:from/:to - get messages between users
router.get('/:from/:to', verifyToken, getMessages);

export default router;
