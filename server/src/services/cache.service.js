import { getRedisClient } from "../config/redis.js";

const serialize = (value) => JSON.stringify(value);
const deserialize = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getCache = async (key) => {
  const client = getRedisClient();

  if (!client?.isReady) {
    return null;
  }

  const cached = await client.get(key);
  return cached ? deserialize(cached) : null;
};

export const setCache = async (key, value, ttlSeconds = 60) => {
  const client = getRedisClient();

  if (!client?.isReady) {
    return;
  }

  await client.set(key, serialize(value), {
    EX: ttlSeconds,
  });
};

export const deleteCache = async (key) => {
  const client = getRedisClient();

  if (!client?.isReady) {
    return;
  }

  await client.del(key);
};

export const deleteByPrefix = async (prefix) => {
  const client = getRedisClient();

  if (!client?.isReady) {
    return;
  }

  const iterator = client.scanIterator({
    MATCH: `${prefix}*`,
    COUNT: 100,
  });

  for await (const key of iterator) {
    await client.del(key);
  }
};

