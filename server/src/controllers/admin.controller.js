import { User } from "../models/User.js";
import { getAdminAnalytics } from "../services/analytics.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAdminDashboard = asyncHandler(async (_request, response) => {
  const analytics = await getAdminAnalytics();

  response.json({
    success: true,
    ...analytics,
  });
});

export const getUsers = asyncHandler(async (_request, response) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();

  response.json({
    success: true,
    items: users,
  });
});

export const approveSeller = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.isSellerApproved = true;
  await user.save();

  response.json({
    success: true,
    user,
  });
});

export const updateUserRole = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.role = request.body.role || user.role;
  if (user.role !== "seller") {
    user.isSellerApproved = true;
  }

  await user.save();

  response.json({
    success: true,
    user,
  });
});

