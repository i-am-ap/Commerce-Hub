import mongoose from "mongoose";

import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const refreshProductRatings = async (productId) => {
  const reviews = await Review.find({ product: productId }).lean();
  const ratingCount = reviews.length;
  const averageRating =
    ratingCount > 0
      ? Number(
          (
            reviews.reduce((accumulator, review) => accumulator + review.rating, 0) / ratingCount
          ).toFixed(1)
        )
      : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    ratingCount,
  });
};

export const getProductReviews = asyncHandler(async (request, response) => {
  const lookup = mongoose.Types.ObjectId.isValid(request.params.productIdOrSlug)
    ? { $or: [{ _id: request.params.productIdOrSlug }, { slug: request.params.productIdOrSlug }] }
    : { slug: request.params.productIdOrSlug };
  const product = await Product.findOne(lookup);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const reviews = await Review.find({ product: product._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  response.json({
    success: true,
    items: reviews,
  });
});

export const upsertReview = asyncHandler(async (request, response) => {
  const { rating, title, comment } = request.body;
  const productId = request.params.productId;

  if (!rating) {
    throw new ApiError(400, "Rating is required.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const verifiedPurchase = await Order.exists({
    user: request.user._id,
    "items.product": productId,
  });

  const review = await Review.findOneAndUpdate(
    {
      product: productId,
      user: request.user._id,
    },
    {
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase: Boolean(verifiedPurchase),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  await refreshProductRatings(productId);

  response.status(201).json({
    success: true,
    item: review,
  });
});

