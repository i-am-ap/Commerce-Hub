import mongoose from "mongoose";

import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { deleteByPrefix } from "../services/cache.service.js";
import { indexProduct, listProducts, removeProductIndex } from "../services/search.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const parseArrayInput = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const buildProductPayload = (body) => {
  const tags = parseArrayInput(body.tags);
  const images = parseArrayInput(body.images).map((image) =>
    typeof image === "string" ? { url: image, publicId: "" } : image
  );
  const specifications = parseArrayInput(body.specifications).map((entry) =>
    typeof entry === "string"
      ? { label: entry, value: "" }
      : { label: entry.label || "", value: entry.value || "" }
  );

  return {
    title: body.title,
    description: body.description,
    summary: body.summary,
    sku: body.sku,
    price: Number(body.price),
    compareAtPrice: Number(body.compareAtPrice || 0),
    stock: Number(body.stock),
    category: body.category,
    tags,
    searchKeywords: [...tags, body.title, body.summary].filter(Boolean),
    images,
    specifications: specifications.filter((item) => item.label),
    featured: body.featured === true || body.featured === "true",
    status: body.status || "published",
  };
};

const ensureProductOwnership = (product, user) => {
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (user.role === "admin") {
    return;
  }

  if (product.seller.toString() !== user._id.toString()) {
    throw new ApiError(403, "You can only manage your own products.");
  }
};

export const getFeaturedProducts = asyncHandler(async (_request, response) => {
  const featured = await Product.find({ status: "published", featured: true })
    .sort({ soldCount: -1, averageRating: -1 })
    .limit(8)
    .populate("category seller", "name slug")
    .lean();

  response.json({
    success: true,
    items: featured,
  });
});

export const getProducts = asyncHandler(async (request, response) => {
  const filters = {
    q: request.query.q,
    category: request.query.category,
    sort: request.query.sort,
    page: request.query.page,
    limit: request.query.limit,
    minPrice: request.query.minPrice,
    maxPrice: request.query.maxPrice,
    tags: request.query.tags ? String(request.query.tags).split(",") : [],
    featured: request.query.featured,
    seller: request.query.seller,
    status:
      request.user?.role === "admin" || request.user?.role === "seller"
        ? request.query.status
        : "published",
  };

  const payload = await listProducts(filters);

  if (request.user && (filters.q || filters.category)) {
    await User.findByIdAndUpdate(request.user._id, {
      $push: {
        searchHistory: {
          $each: [
            {
              term: filters.q || "",
              category: filters.category || "",
              createdAt: new Date(),
            },
          ],
          $slice: -20,
        },
      },
      $addToSet: {
        interests: {
          $each: [filters.category, filters.q].filter(Boolean),
        },
      },
    });
  }

  response.json({
    success: true,
    ...payload,
  });
});

export const getProductBySlug = asyncHandler(async (request, response) => {
  const { slugOrId } = request.params;
  const lookup = mongoose.Types.ObjectId.isValid(slugOrId)
    ? { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    : { slug: slugOrId };

  const product = await Product.findOne(lookup)
    .populate("category seller", "name slug email avatar")
    .lean();

  if (!product || product.status === "archived") {
    throw new ApiError(404, "Product not found.");
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id || product.category,
    status: "published",
  })
    .sort({ featured: -1, averageRating: -1 })
    .limit(4)
    .populate("category seller", "name slug")
    .lean();

  response.json({
    success: true,
    item: product,
    related,
  });
});

export const createProduct = asyncHandler(async (request, response) => {
  const payload = buildProductPayload(request.body);

  if (!payload.title || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
    throw new ApiError(400, "Title, description, price, and stock are required.");
  }

  if (!payload.images.length) {
    throw new ApiError(400, "At least one image is required.");
  }

  const product = await Product.create({
    ...payload,
    seller: request.user._id,
  });

  await Promise.all([deleteByPrefix("products:"), indexProduct(product)]);

  response.status(201).json({
    success: true,
    item: await product.populate("category seller", "name slug email"),
  });
});

export const updateProduct = asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.productId);
  ensureProductOwnership(product, request.user);

  const payload = buildProductPayload({
    ...product.toObject(),
    ...request.body,
    images: request.body.images ?? product.images,
    tags: request.body.tags ?? product.tags,
    specifications: request.body.specifications ?? product.specifications,
  });

  Object.assign(product, payload);
  await product.save();

  await Promise.all([deleteByPrefix("products:"), indexProduct(product)]);

  response.json({
    success: true,
    item: await product.populate("category seller", "name slug email"),
  });
});

export const deleteProduct = asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.productId);
  ensureProductOwnership(product, request.user);

  await product.deleteOne();
  await Promise.all([deleteByPrefix("products:"), removeProductIndex(product._id)]);

  response.json({
    success: true,
    message: "Product deleted successfully.",
  });
});

