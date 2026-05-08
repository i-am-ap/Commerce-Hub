import { Router } from "express";

import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import cartRoutes from "./cart.routes.js";
import categoryRoutes from "./category.routes.js";
import notificationRoutes from "./notification.routes.js";
import orderRoutes from "./order.routes.js";
import productRoutes from "./product.routes.js";
import recommendationRoutes from "./recommendation.routes.js";
import reviewRoutes from "./review.routes.js";
import sellerRoutes from "./seller.routes.js";
import uploadRoutes from "./upload.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/users", userRoutes);
router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/notifications", notificationRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;

