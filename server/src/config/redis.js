import { createClient } from "redis";

import { env } from "./env.js";

let redisClient;

export const connectRedis = async () => {
  if (!env.redisUrl) {
    return null;
  }

  redisClient = createClient({
    url: env.redisUrl,
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
};

export const getRedisClient = () => redisClient;

