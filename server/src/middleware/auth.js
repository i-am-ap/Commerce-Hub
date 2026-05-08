import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getTokenFromRequest = (request) => {
  const authorization = request.headers.authorization || "";

  if (request.cookies?.access_token) {
    return request.cookies.access_token;
  }

  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return null;
};

export const protect = asyncHandler(async (request, _response, next) => {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  const payload = jwt.verify(token, env.accessTokenSecret);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Session is no longer valid.");
  }

  request.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (request, _response, next) => {
  const token = getTokenFromRequest(request);

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.accessTokenSecret);
    const user = await User.findById(payload.sub);

    if (user) {
      request.user = user;
    }
  } catch {
    request.user = null;
  }

  return next();
});

export const authorize =
  (...roles) =>
  (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new ApiError(403, "You are not allowed to access this resource."));
    }

    return next();
  };

export const requireApprovedSeller = (request, _response, next) => {
  if (!request.user) {
    return next(new ApiError(401, "Authentication required."));
  }

  if (request.user.role !== "seller" || !request.user.isSellerApproved) {
    return next(new ApiError(403, "Seller approval is required."));
  }

  return next();
};
