import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { env } from "../config/env.js";
import { registerSocketServer } from "../services/notification.service.js";

export const configureSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || "");
      const token = cookies.access_token;

      if (!token) {
        return next();
      }

      const payload = jwt.verify(token, env.accessTokenSecret);
      socket.data.userId = payload.sub;
      return next();
    } catch {
      return next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }
  });

  registerSocketServer(io);
  return io;
};
