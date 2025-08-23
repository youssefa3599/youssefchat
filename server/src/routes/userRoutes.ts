import { Router } from "express";
import { getAllUsers } from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// ✅ Mount this route so that it responds to GET /api/users
router.get("/", verifyToken, getAllUsers);

export default router;
