import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { swaggerMiddleware } from "./config/swagger.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import apiRoutes from "./routes/index.js";

export const app = express();

// app.use(
//   cors({
//     origin: env.clientUrl,
//     credentials: true,
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",
  "https://commerce-hub-client.vercel.app",
  /\.vercel\.app$/ // allow all preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some(o =>
        typeof o === "string"
          ? o === origin
          : o.test(origin)
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(compression());
app.use(apiRateLimiter);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Commerce Hub Backend API Running 🚀",
  });
});

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Commerce Hub API is healthy.",
    environment: env.nodeEnv,
  });
});

app.use("/docs", ...swaggerMiddleware);
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

