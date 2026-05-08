import http from "http";

import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { connectRedis } from "./config/redis.js";
import { configureSocketServer } from "./sockets/index.js";

const startServer = async () => {
  await connectDatabase();

  try {
    await connectRedis();
  } catch (error) {
    console.warn("Redis unavailable, continuing without cache/session store:", error.message);
  }

  const server = http.createServer(app);
  configureSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Commerce Hub API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

