import { Cart } from "../models/Cart.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { createNotification } from "../services/notification.service.js";
import { createPaymentIntent } from "../services/payment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toSnapshotAddress = (address) => ({
  fullName: address.fullName || "",
  line1: address.line1 || "",
  line2: address.line2 || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "",
  phone: address.phone || "",
});

const resolveAddress = ({ user, addressId, inlineAddress }) => {
  if (inlineAddress?.line1) {
    return toSnapshotAddress(inlineAddress);
  }

  if (addressId) {
    const address = user.addresses.id(addressId);
    if (address) {
      return toSnapshotAddress(address);
    }
  }

  const fallback = user.addresses.find((entry) => entry.isDefault) || user.addresses[0];
  if (fallback) {
    return toSnapshotAddress(fallback);
  }

  throw new ApiError(400, "A shipping address is required.");
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

  return coupon.discountType === "fixed"
    ? Math.min(coupon.value, subtotal)
    : Math.round((subtotal * coupon.value) / 100);
};

export const checkout = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);
  const cart = await Cart.findOne({ user: request.user._id });

  if (!cart || !cart.items.length) {
    throw new ApiError(400, "Cart is empty.");
  }

  const products = await Product.find({ _id: { $in: cart.items.map((item) => item.product) } }).populate(
    "category",
    "name"
  );
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const items = cart.items.map((item) => {
    const liveProduct = productMap.get(item.product.toString());

    if (!liveProduct) {
      throw new ApiError(400, `Product ${item.title} is no longer available.`);
    }

    if (liveProduct.stock < item.quantity) {
      throw new ApiError(400, `${liveProduct.title} has insufficient stock.`);
    }

    const price = liveProduct.price;

    return {
      product: liveProduct._id,
      seller: liveProduct.seller,
      title: liveProduct.title,
      slug: liveProduct.slug,
      image: liveProduct.images[0]?.url || item.image,
      category: liveProduct.category?.name || "",
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });

  const subtotal = items.reduce((accumulator, item) => accumulator + item.lineTotal, 0);
  const coupon = cart.couponCode ? await Coupon.findOne({ code: cart.couponCode }) : null;
  const discountAmount = calculateDiscount(coupon, subtotal);
  const shippingAmount = subtotal >= 1000 ? 0 : 80;
  const taxAmount = Math.round(subtotal * 0.05);
  const total = Math.max(subtotal + taxAmount + shippingAmount - discountAmount, 0);
  const paymentProvider = request.body.paymentProvider || "cod";

  const payment = await createPaymentIntent({
    amount: total,
    provider: paymentProvider,
    metadata: {
      userId: user._id.toString(),
      itemCount: String(items.length),
    },
  });

  const shippingAddress = resolveAddress({
    user,
    addressId: request.body.shippingAddressId,
    inlineAddress: request.body.shippingAddress,
  });
  const billingAddress = resolveAddress({
    user,
    addressId: request.body.billingAddressId,
    inlineAddress: request.body.billingAddress || request.body.shippingAddress,
  });

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    billingAddress,
    couponCode: coupon?.code || "",
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount,
    total,
    paymentProvider: payment.provider,
    paymentIntentId: payment.paymentIntentId,
    paymentStatus: payment.provider === "cod" ? "pending" : payment.paymentStatus,
    orderStatus: payment.provider === "cod" ? "processing" : "pending",
    timeline: [
      {
        status: "pending",
        note: "Order placed successfully.",
      },
      {
        status: payment.provider === "cod" ? "processing" : "payment_pending",
        note:
          payment.provider === "cod"
            ? "Cash on delivery selected."
            : `Payment initiated via ${payment.provider}.`,
      },
    ],
  });

  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
      },
    }))
  );

  if (coupon) {
    coupon.usedBy.addToSet(user._id);
    await coupon.save();
  }

  cart.items = [];
  cart.couponCode = "";
  cart.discountAmount = 0;
  cart.subtotal = 0;
  cart.total = 0;
  await cart.save();

  const sellerIds = [...new Set(items.map((item) => item.seller.toString()))];
  await Promise.all([
    createNotification({
      userId: user._id,
      title: "Order confirmed",
      message: `Your order ${order._id} has been placed successfully.`,
      type: "order",
      link: `/dashboard/orders/${order._id}`,
    }),
    ...sellerIds.map((sellerId) =>
      createNotification({
        userId: sellerId,
        title: "New seller order",
        message: `A new order ${order._id} includes your products.`,
        type: "seller",
        link: "/seller/orders",
      })
    ),
  ]);

  response.status(201).json({
    success: true,
    item: order,
    payment,
  });
});

export const getMyOrders = asyncHandler(async (request, response) => {
  const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 }).lean();

  response.json({
    success: true,
    items: orders,
  });
});

export const getOrderById = asyncHandler(async (request, response) => {
  const order = await Order.findById(request.params.orderId)
    .populate("user", "name email")
    .populate("items.seller", "name email");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const isOwner = order.user._id.toString() === request.user._id.toString();
  const isAdmin = request.user.role === "admin";
  const isSeller = order.items.some(
    (item) =>
      typeof item.seller === "object" &&
      item.seller._id.toString() === request.user._id.toString()
  );

  if (!isOwner && !isAdmin && !isSeller) {
    throw new ApiError(403, "You are not allowed to view this order.");
  }

  response.json({
    success: true,
    item: order,
  });
});

export const updateOrderStatus = asyncHandler(async (request, response) => {
  const { status, note } = request.body;

  if (!status) {
    throw new ApiError(400, "Order status is required.");
  }

  if (!["seller", "admin"].includes(request.user.role)) {
    throw new ApiError(403, "Only sellers and admins can update orders.");
  }

  const order = await Order.findById(request.params.orderId);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const sellerOwnsOrder = order.items.some(
    (item) => item.seller.toString() === request.user._id.toString()
  );

  if (request.user.role === "seller" && !sellerOwnsOrder) {
    throw new ApiError(403, "You can only update orders for your own products.");
  }

  order.orderStatus = status;
  if (status === "delivered" && order.paymentProvider === "cod") {
    order.paymentStatus = "paid";
  }

  order.timeline.push({
    status,
    note: note || `Order updated to ${status}.`,
  });

  await order.save();

  await createNotification({
    userId: order.user,
    title: "Order status updated",
    message: `Order ${order._id} is now ${status}.`,
    type: "order",
    link: `/dashboard/orders/${order._id}`,
  });

  response.json({
    success: true,
    item: order,
  });
});
