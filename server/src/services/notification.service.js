import { Notification } from "../models/Notification.js";

let ioInstance;

export const registerSocketServer = (io) => {
  ioInstance = io;
};

export const createNotification = async ({ userId, title, message, type = "system", link = "" }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit("notification:new", notification);
  }

  return notification;
};
