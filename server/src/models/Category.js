import mongoose from "mongoose";

import { slugify } from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true },
    image: { type: String, default: "" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }

  next();
});

export const Category = mongoose.model("Category", categorySchema);

