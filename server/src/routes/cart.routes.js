import { Router } from "express";

import {
  addToCart,
  applyCoupon,
  getCart,
  removeCartItem,
  syncGuestCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.post("/coupon", applyCoupon);
router.post("/sync", syncGuestCart);

export default router;
