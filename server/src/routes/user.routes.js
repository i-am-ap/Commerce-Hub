import { Router } from "express";

import { getWishlist, toggleWishlist, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.put("/profile", updateProfile);
router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", toggleWishlist);

export default router;

