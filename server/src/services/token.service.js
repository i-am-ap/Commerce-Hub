import crypto from "crypto";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { getRedisClient } from "../config/redis.js";

const durationToMilliseconds = (value) => {
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(value);

  if (!match) {
    return 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * map[unit];
};

const durationToSeconds = (value) => Math.floor(durationToMilliseconds(value) / 1000);

const buildSessionKey = (userId, sessionId) =>
  `${env.sessionPrefix}:refresh:${userId}:${sessionId}`;

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      name: user.name,
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenTtl,
    }
  );

export const signRefreshToken = (user, sessionId) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      sid: sessionId,
      type: "refresh",
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenTtl,
    }
  );

export const createSessionTokens = async (user) => {
  const sessionId = crypto.randomUUID();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, sessionId);
  const client = getRedisClient();

  if (client?.isReady) {
    await client.set(buildSessionKey(user._id, sessionId), user._id.toString(), {
      EX: durationToSeconds(env.refreshTokenTtl),
    });
  }

  return {
    accessToken,
    refreshToken,
    sessionId,
    accessTokenMaxAge: durationToMilliseconds(env.accessTokenTtl),
    refreshTokenMaxAge: durationToMilliseconds(env.refreshTokenTtl),
  };
};

export const verifyRefreshToken = async (token) => {
  const payload = jwt.verify(token, env.refreshTokenSecret);
  const client = getRedisClient();

  if (client?.isReady) {
    const stored = await client.get(buildSessionKey(payload.sub, payload.sid));
    if (!stored) {
      throw new Error("Refresh session expired.");
    }
  }

  return payload;
};

export const revokeRefreshToken = async (userId, sessionId) => {
  const client = getRedisClient();

  if (!client?.isReady || !sessionId) {
    return;
  }

  await client.del(buildSessionKey(userId, sessionId));
};

export const decodeRefreshToken = (token) => jwt.decode(token);

