import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);

  user.name = request.body.name ?? user.name;
  user.phone = request.body.phone ?? user.phone;
  user.avatar = request.body.avatar ?? user.avatar;

  if (Array.isArray(request.body.addresses)) {
    user.addresses = request.body.addresses;
  }

  await user.save();

  response.json({
    success: true,
    user: user.toJSON(),
  });
});

export const toggleWishlist = asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const user = await User.findById(request.user._id);
  const index = user.wishlist.findIndex((item) => item.toString() === product._id.toString());

  if (index >= 0) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(product._id);
    user.interests = [...new Set([...(user.interests || []), ...(product.tags || [])])];
  }

  await user.save();
  await user.populate("wishlist");

  response.json({
    success: true,
    wishlist: user.wishlist,
  });
});

export const getWishlist = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).populate({
    path: "wishlist",
    populate: [{ path: "category", select: "name slug" }, { path: "seller", select: "name slug" }],
  });

  response.json({
    success: true,
    items: user.wishlist,
  });
});

