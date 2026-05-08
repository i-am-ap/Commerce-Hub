import { Cart } from "../models/Cart.js";
import { Coupon } from "../models/Coupon.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const calculateDiscount = (coupon, subtotal) => {
  if (!coupon || !coupon.isActive) {
    return 0;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return 0;
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return 0;
  }

  if (coupon.usageLimit && coupon.usedBy.length >= coupon.usageLimit) {
    return 0;
  }

  return coupon.discountType === "fixed"
    ? Math.min(coupon.value, subtotal)
    : Math.round((subtotal * coupon.value) / 100);
};

const recalculateCart = async (cart) => {
  const subtotal = cart.items.reduce(
    (accumulator, item) => accumulator + item.priceSnapshot * item.quantity,
    0
  );

  let coupon = null;
  if (cart.couponCode) {
    coupon = await Coupon.findOne({ code: cart.couponCode.toUpperCase() });
  }

  const discountAmount = calculateDiscount(coupon, subtotal);

  if (cart.couponCode && !discountAmount) {
    cart.couponCode = "";
  }

  cart.subtotal = subtotal;
  cart.discountAmount = discountAmount;
  cart.total = Math.max(subtotal - discountAmount, 0);

  await cart.save();

  return cart.populate("items.product", "stock category averageRating");
};

export const getCart = asyncHandler(async (request, response) => {
  const cart = await getOrCreateCart(request.user._id);
  await cart.populate("items.product", "stock category averageRating");

  response.json({
    success: true,
    item: cart,
  });
});

export const addToCart = asyncHandler(async (request, response) => {
  const { productId, quantity = 1 } = request.body;

  if (!productId) {
    throw new ApiError(400, "Product is required.");
  }

  const product = await Product.findById(productId);
  if (!product || product.status !== "published") {
    throw new ApiError(404, "Product not found.");
  }

  const cart = await getOrCreateCart(request.user._id);
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  const desiredQuantity = Math.max(Number(quantity) || 1, 1);

  if (item) {
    item.quantity = Math.min(item.quantity + desiredQuantity, product.stock);
    item.priceSnapshot = product.price;
  } else {
    cart.items.push({
      product: product._id,
      seller: product.seller,
      title: product.title,
      slug: product.slug,
      image: product.images[0].url,
      priceSnapshot: product.price,
      quantity: Math.min(desiredQuantity, product.stock),
    });
  }

  const updatedCart = await recalculateCart(cart);

  response.status(201).json({
    success: true,
    item: updatedCart,
  });
});

export const updateCartItem = asyncHandler(async (request, response) => {
  const { quantity } = request.body;
  const cart = await getOrCreateCart(request.user._id);
  const item = cart.items.find((entry) => entry.product.toString() === request.params.productId);

  if (!item) {
    throw new ApiError(404, "Cart item not found.");
  }

  const product = await Product.findById(request.params.productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  item.quantity = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  item.priceSnapshot = product.price;

  const updatedCart = await recalculateCart(cart);

  response.json({
    success: true,
    item: updatedCart,
  });
});

export const removeCartItem = asyncHandler(async (request, response) => {
  const cart = await getOrCreateCart(request.user._id);
  cart.items = cart.items.filter((entry) => entry.product.toString() !== request.params.productId);

  const updatedCart = await recalculateCart(cart);

  response.json({
    success: true,
    item: updatedCart,
  });
});

export const applyCoupon = asyncHandler(async (request, response) => {
  const { code } = request.body;

  if (!code) {
    throw new ApiError(400, "Coupon code is required.");
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new ApiError(404, "Coupon not found.");
  }

  const cart = await getOrCreateCart(request.user._id);
  cart.couponCode = coupon.code;
  const updatedCart = await recalculateCart(cart);

  if (!updatedCart.couponCode) {
    throw new ApiError(400, "Coupon is not valid for the current cart.");
  }

  response.json({
    success: true,
    item: updatedCart,
  });
});

export const syncGuestCart = asyncHandler(async (request, response) => {
  const { items = [] } = request.body;
  const cart = await getOrCreateCart(request.user._id);

  for (const rawItem of items) {
    const product = await Product.findById(rawItem.productId);
    if (!product || product.status !== "published") {
      continue;
    }

    const existing = cart.items.find((entry) => entry.product.toString() === product._id.toString());
    const quantity = Math.max(Number(rawItem.quantity) || 1, 1);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      existing.priceSnapshot = product.price;
    } else {
      cart.items.push({
        product: product._id,
        seller: product.seller,
        title: product.title,
        slug: product.slug,
        image: product.images[0].url,
        priceSnapshot: product.price,
        quantity: Math.min(quantity, product.stock),
      });
    }
  }

  const updatedCart = await recalculateCart(cart);

  response.json({
    success: true,
    item: updatedCart,
  });
});

