import { Router } from "express";

import {
  getSellerDashboard,
  getSellerOrders,
  getSellerProducts,
} from "../controllers/seller.controller.js";
import { protect, requireApprovedSeller } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireApprovedSeller);
router.get("/dashboard", getSellerDashboard);
router.get("/products", getSellerProducts);
router.get("/orders", getSellerOrders);

export default router;

