import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { optionalAuth, protect, requireApprovedSeller } from "../middleware/auth.js";

const router = Router();

router.get("/featured", getFeaturedProducts);
router.get("/", optionalAuth, getProducts);
router.get("/:slugOrId", optionalAuth, getProductBySlug);
router.post("/", protect, requireApprovedSeller, createProduct);
router.put("/:productId", protect, requireApprovedSeller, updateProduct);
router.delete("/:productId", protect, requireApprovedSeller, deleteProduct);

export default router;
