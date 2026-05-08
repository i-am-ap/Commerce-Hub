import { Router } from "express";

import {
  approveSeller,
  getAdminDashboard,
  getUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", getAdminDashboard);
router.get("/users", getUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/sellers/:userId/approve", approveSeller);

export default router;
