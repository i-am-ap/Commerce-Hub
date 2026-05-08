import mongoose from "mongoose";

import { slugify } from "../utils/slugify.js";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    sku: { type: String, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: String, trim: true }],
    searchKeywords: [{ type: String, trim: true }],
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => Array.isArray(images) && images.length > 0,
        message: "At least one product image is required.",
      },
    },
    specifications: [specificationSchema],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("validate", function setSlug(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }

  if (!this.searchKeywords?.length) {
    this.searchKeywords = [this.title, ...(this.tags || [])];
  }

  next();
});

productSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  searchKeywords: "text",
});

export const Product = mongoose.model("Product", productSchema);

