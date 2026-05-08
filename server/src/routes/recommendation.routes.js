import { Router } from "express";

import { getPersonalizedRecommendations } from "../controllers/recommendation.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, getPersonalizedRecommendations);

export default router;

