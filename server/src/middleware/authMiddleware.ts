import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  console.log("🛡️ [verifyToken] Incoming request to:", req.originalUrl);
  console.log("🔍 [verifyToken] Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("❌ [verifyToken] Missing or malformed Authorization header");
    return res.status(401).json({ message: 'No token provided or malformed' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔐 [verifyToken] Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    console.log("✅ [verifyToken] Token verified successfully:", decoded);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("❌ [verifyToken] Token verification failed:", error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
