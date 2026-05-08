import { Router } from "express";

import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  me,
  refreshSession,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(authRateLimiter);
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refreshSession);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;

