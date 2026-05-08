import { Router } from "express";

import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getNotifications);
router.patch("/:notificationId/read", markNotificationRead);

export default router;

