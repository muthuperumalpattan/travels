import { Router } from "express";
import { login, logout, me } from "../controllers/authController";
import { loginLimiter } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
