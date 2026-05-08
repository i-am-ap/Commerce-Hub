import { Router } from "express";

import { uploadImages } from "../controllers/upload.controller.js";
import { protect, requireApprovedSeller } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", protect, requireApprovedSeller, upload.array("images", 6), uploadImages);

export default router;

