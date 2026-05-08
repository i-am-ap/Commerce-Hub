import { Router } from "express";

import { getProductReviews, upsertReview } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/product/:productIdOrSlug", getProductReviews);
router.post("/product/:productId", protect, upsertReview);

export default router;

