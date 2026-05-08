import { getRecommendationsForUser } from "../services/recommendation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPersonalizedRecommendations = asyncHandler(async (request, response) => {
  const items = await getRecommendationsForUser(request.user?._id, Number(request.query.limit || 8));

  response.json({
    success: true,
    items,
  });
});

