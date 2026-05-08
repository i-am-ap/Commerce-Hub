import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { ROLES } from "../constants/roles.js";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    fullName: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const searchHistorySchema = new mongoose.Schema(
  {
    term: { type: String, trim: true },
    category: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, index: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    phone: { type: String, trim: true },
    isSellerApproved: {
      type: Boolean,
      default: function defaultSellerApproval() {
        return this.role !== ROLES.SELLER;
      },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    interests: [{ type: String, trim: true }],
    searchHistory: [searchHistorySchema],
    addresses: [addressSchema],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returned) => {
        delete returned.password;
        delete returned.resetPasswordToken;
        delete returned.resetPasswordExpires;
        return returned;
      },
    },
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);

