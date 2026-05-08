import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/commerce-hub",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  elasticsearchNode: process.env.ELASTICSEARCH_NODE || "",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "dev-access-secret",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  sessionPrefix: process.env.SESSION_PREFIX || "commercehub",
  emailFrom: process.env.EMAIL_FROM || "no-reply@commercehub.dev",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};

