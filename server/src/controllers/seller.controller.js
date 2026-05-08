import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { getSellerAnalytics } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSellerDashboard = asyncHandler(async (request, response) => {
  const analytics = await getSellerAnalytics(request.user._id);

  response.json({
    success: true,
    ...analytics,
  });
});

export const getSellerProducts = asyncHandler(async (request, response) => {
  const items = await Product.find({ seller: request.user._id })
    .sort({ createdAt: -1 })
    .populate("category", "name slug")
    .lean();

  response.json({
    success: true,
    items,
  });
});

export const getSellerOrders = asyncHandler(async (request, response) => {
  const items = await Order.find({ "items.seller": request.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();

  response.json({
    success: true,
    items,
  });
});

