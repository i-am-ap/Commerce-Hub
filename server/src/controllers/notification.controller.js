import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (request, response) => {
  const items = await Notification.find({ user: request.user._id })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  response.json({
    success: true,
    items,
  });
});

export const markNotificationRead = asyncHandler(async (request, response) => {
  const notification = await Notification.findOne({
    _id: request.params.notificationId,
    user: request.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  notification.read = true;
  await notification.save();

  response.json({
    success: true,
    item: notification,
  });
});

