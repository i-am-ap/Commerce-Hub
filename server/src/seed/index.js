import mongoose from "mongoose";

import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { indexProduct } from "../services/search.service.js";

const categorySeed = [
  {
    name: "Electronics",
    description: "Laptops, accessories, audio, and smart devices.",
    image: "https://placehold.co/600x400/eef2ff/111827?text=Electronics",
    isFeatured: true,
  },
  {
    name: "Fashion",
    description: "Style-forward apparel, footwear, and essentials.",
    image: "https://placehold.co/600x400/fef3c7/111827?text=Fashion",
    isFeatured: true,
  },
  {
    name: "Home",
    description: "Furniture, decor, and everyday living upgrades.",
    image: "https://placehold.co/600x400/d1fae5/111827?text=Home",
    isFeatured: false,
  },
];

const productSeed = (categories, sellerId) => [
  {
    title: "Aether Wireless Headphones",
    description: "ANC headphones with 40-hour battery life and premium memory foam earcups.",
    summary: "Premium ANC audio for commuting and work.",
    price: 8999,
    compareAtPrice: 10999,
    stock: 35,
    category: categories.electronics._id,
    tags: ["audio", "headphones", "wireless"],
    images: [{ url: "https://placehold.co/800x800/f3f4f6/111827?text=Headphones", publicId: "" }],
    specifications: [
      { label: "Battery", value: "40 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
    ],
    featured: true,
    seller: sellerId,
  },
  {
    title: "Nimbus Performance Sneakers",
    description: "Lightweight sneakers with breathable knit upper and responsive foam sole.",
    summary: "Daily wear comfort with clean street styling.",
    price: 4999,
    compareAtPrice: 6499,
    stock: 52,
    category: categories.fashion._id,
    tags: ["shoes", "fashion", "sneakers"],
    images: [{ url: "https://placehold.co/800x800/fef3c7/111827?text=Sneakers", publicId: "" }],
    specifications: [
      { label: "Material", value: "Knit mesh" },
      { label: "Fit", value: "Regular" },
    ],
    featured: true,
    seller: sellerId,
  },
  {
    title: "Oakline Study Lamp",
    description: "Minimal desk lamp with adjustable neck, dimmable lighting, and USB-C charging.",
    summary: "Focused workspace lighting with a modern silhouette.",
    price: 2499,
    compareAtPrice: 2999,
    stock: 24,
    category: categories.home._id,
    tags: ["home", "lighting", "desk"],
    images: [{ url: "https://placehold.co/800x800/d1fae5/111827?text=Lamp", publicId: "" }],
    specifications: [
      { label: "Power", value: "USB-C" },
      { label: "Modes", value: "3 brightness levels" },
    ],
    featured: false,
    seller: sellerId,
  },
];

const run = async () => {
  await connectDatabase();

  await Promise.all([
    Order.deleteMany({}),
    Review.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);

  const [admin, customer, seller] = await User.create([
    {
      name: "Admin User",
      email: "admin@commercehub.dev",
      password: "Admin@123",
      role: "admin",
      isSellerApproved: true,
      addresses: [
        {
          label: "HQ",
          fullName: "Admin User",
          line1: "21 Market Street",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
          phone: "9999999999",
          isDefault: true,
        },
      ],
    },
    {
      name: "Customer Demo",
      email: "customer@commercehub.dev",
      password: "Customer@123",
      role: "customer",
      isSellerApproved: true,
      interests: ["audio", "home"],
      addresses: [
        {
          label: "Home",
          fullName: "Customer Demo",
          line1: "88 Residency Road",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560025",
          country: "India",
          phone: "8888888888",
          isDefault: true,
        },
      ],
    },
    {
      name: "Seller Demo",
      email: "seller@commercehub.dev",
      password: "Seller@123",
      role: "seller",
      isSellerApproved: true,
      addresses: [
        {
          label: "Warehouse",
          fullName: "Seller Demo",
          line1: "14 Industrial Layout",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560029",
          country: "India",
          phone: "7777777777",
          isDefault: true,
        },
      ],
    },
  ]);

  const categories = await Category.create(categorySeed);
  const categoryMap = {
    electronics: categories[0],
    fashion: categories[1],
    home: categories[2],
  };

  const products = await Product.create(productSeed(categoryMap, seller._id));
  await Promise.all(products.map((product) => indexProduct(product)));

  await Coupon.create([
    {
      code: "WELCOME10",
      description: "10% off for new customers",
      discountType: "percentage",
      value: 10,
      minOrderValue: 1000,
      isActive: true,
    },
    {
      code: "SAVE500",
      description: "Flat 500 off on big orders",
      discountType: "fixed",
      value: 500,
      minOrderValue: 5000,
      isActive: true,
    },
  ]);

  customer.wishlist = [products[0]._id];
  await customer.save();

  console.log("Seed complete:");
  console.log("Admin -> admin@commercehub.dev / Admin@123");
  console.log("Seller -> seller@commercehub.dev / Seller@123");
  console.log("Customer -> customer@commercehub.dev / Customer@123");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
