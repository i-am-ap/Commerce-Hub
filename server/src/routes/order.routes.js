import { Router } from "express";

import {
  checkout,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getMyOrders);
router.post("/checkout", checkout);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
