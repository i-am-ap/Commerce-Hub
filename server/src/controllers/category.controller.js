import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (_request, response) => {
  const categories = await Category.find().populate("parent", "name slug").sort({ name: 1 }).lean();

  response.json({
    success: true,
    items: categories,
  });
});

export const createCategory = asyncHandler(async (request, response) => {
  const { name, description, image, parent, isFeatured } = request.body;

  if (!name) {
    throw new ApiError(400, "Category name is required.");
  }

  const category = await Category.create({
    name,
    description,
    image,
    parent: parent || null,
    isFeatured: Boolean(isFeatured),
  });

  response.status(201).json({
    success: true,
    item: category,
  });
});

