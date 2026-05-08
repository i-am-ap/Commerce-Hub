import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (_request, _response, next) => {
  next(new ApiError(404, "Resource not found."));
};

export const errorHandler = (error, _request, response, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message: error.message || "Unexpected server error.",
    details: error instanceof ApiError ? error.details : null,
  });
};

