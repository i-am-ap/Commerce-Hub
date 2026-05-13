import crypto from "crypto";

import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.js";
import { ROLES } from "../constants/roles.js";
import { User } from "../models/User.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import {
  createSessionTokens,
  decodeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

const serializeUser = (user) => user.toJSON();

export const register = asyncHandler(async (request, response) => {
  const { name, password, role = ROLES.CUSTOMER } = request.body;
  const email = request.body.email.toLowerCase();

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  if (![ROLES.CUSTOMER, ROLES.SELLER].includes(role)) {
    throw new ApiError(400, "Only customer and seller signups are allowed.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isSellerApproved: role === ROLES.SELLER ? false : true,
  });

  const tokens = await createSessionTokens(user);
  setAuthCookies(response, tokens);

  response.status(201).json({
    success: true,
    message:
      role === ROLES.SELLER
        ? "Seller account created. Admin approval is pending."
        : "Account created successfully.",
    user: serializeUser(user),
  });
});

export const login = asyncHandler(async (request, response) => {
  const { password } = request.body;
  const email = request.body.email.toLowerCase();

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({
  email,
  }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokens = await createSessionTokens(user);
  setAuthCookies(response, tokens);

  response.json({
    success: true,
    message: "Logged in successfully.",
    user: serializeUser(user),
  });
});

export const googleLogin = asyncHandler(async (request, response) => {
  const { credential, role = ROLES.CUSTOMER } = request.body;

  if (!googleClient || !env.googleClientId) {
    throw new ApiError(503, "Google OAuth is not configured for this environment.");
  }

  if (!credential) {
    throw new ApiError(400, "Google credential token is required.");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new ApiError(400, "Unable to verify Google account.");
  }

  const email = payload.email.toLowerCase();

  let user = await User.findOne({ email });

  if (user && !user.googleId) {
  user.googleId = payload.sub;

  if (!user.avatar?.url) {
    user.avatar = {
      url: payload.picture || "",
      publicId: "",
    };
  }

  await user.save();
  }

  if (!user) {
    user = await User.create({
      name: payload.name || email.split("@")[0],
      email,
      googleId: payload.sub,
      avatar: {
        url: payload.picture || "",
        publicId: "",
      },
      role: [ROLES.CUSTOMER, ROLES.SELLER].includes(role) ? role : ROLES.CUSTOMER,
      isSellerApproved: role === ROLES.SELLER ? false : true,
    });
  }

  const tokens = await createSessionTokens(user);
  setAuthCookies(response, tokens);

  response.json({
    success: true,
    message: "Logged in with Google successfully.",
    user: serializeUser(user),
  });
});

export const refreshSession = asyncHandler(async (request, response) => {
  const refreshToken = request.cookies?.refresh_token;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  const payload = await verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "User does not exist.");
  }

  await revokeRefreshToken(payload.sub, payload.sid);
  const tokens = await createSessionTokens(user);
  setAuthCookies(response, tokens);

  response.json({
    success: true,
    message: "Session refreshed successfully.",
    user: serializeUser(user),
  });
});

export const logout = asyncHandler(async (request, response) => {
  const refreshToken = request.cookies?.refresh_token;

  if (refreshToken) {
    const decoded = decodeRefreshToken(refreshToken);
    if (decoded?.sub && decoded?.sid) {
      await revokeRefreshToken(decoded.sub, decoded.sid);
    }
  }

  clearAuthCookies(response);

  response.json({
    success: true,
    message: "Logged out successfully.",
  });
});

export const me = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    user: request.user.toJSON(),
  });
});

export const forgotPassword = asyncHandler(async (request, response) => {
  const { email } = request.body;

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl: `${env.clientUrl}/reset-password?token=${token}`,
    });
  }

  response.json({
    success: true,
    message: "If the email exists, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (request, response) => {
  const { token, password } = request.body;

  if (!token || !password) {
    throw new ApiError(400, "Reset token and new password are required.");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or expired.");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  response.json({
    success: true,
    message: "Password reset successfully.",
  });
});

