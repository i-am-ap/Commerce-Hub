import { env } from "../config/env.js";

// const baseCookieOptions = {
//   httpOnly: true,
//   sameSite: "lax",
//   secure: env.isProduction,
//   domain: env.isProduction ? env.cookieDomain : undefined,
//   path: "/",
// };

const baseCookieOptions = {
  httpOnly: true,
  sameSite: env.isProduction ? "none" : "lax",
  secure: env.isProduction,
  path: "/",
};

export const setAuthCookies = (response, payload) => {
  response.cookie("access_token", payload.accessToken, {
    ...baseCookieOptions,
    maxAge: payload.accessTokenMaxAge,
  });

  response.cookie("refresh_token", payload.refreshToken, {
    ...baseCookieOptions,
    maxAge: payload.refreshTokenMaxAge,
  });
};

export const clearAuthCookies = (response) => {
  response.clearCookie("access_token", baseCookieOptions);
  response.clearCookie("refresh_token", baseCookieOptions);
};

