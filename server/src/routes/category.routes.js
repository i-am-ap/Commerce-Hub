import { Router } from "express";

import { createCategory, listCategories } from "../controllers/category.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.post("/", protect, authorize("admin"), createCategory);

export default router;
