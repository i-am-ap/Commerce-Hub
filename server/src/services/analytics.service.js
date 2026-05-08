import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

const sumReducer = (accumulator, item) => accumulator + item;

export const getAdminAnalytics = async () => {
  const [users, sellersPending, products, orders] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "seller", isSellerApproved: false }),
    Product.countDocuments(),
    Order.find().lean(),
  ]);

  const revenue = orders
    .filter((order) => order.paymentStatus !== "failed")
    .map((order) => order.total)
    .reduce(sumReducer, 0);

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const topCategories = orders.reduce((accumulator, order) => {
    order.items.forEach((item) => {
      const key = item.category || "Other";
      accumulator[key] = (accumulator[key] || 0) + item.quantity;
    });

    return accumulator;
  }, {});

  return {
    stats: {
      users,
      sellersPending,
      products,
      orders: orders.length,
      revenue,
    },
    topCategories: Object.entries(topCategories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    recentOrders,
  };
};

export const getSellerAnalytics = async (sellerId) => {
  const [products, orders] = await Promise.all([
    Product.find({ seller: sellerId }).sort({ createdAt: -1 }).lean(),
    Order.find({ "items.seller": sellerId }).sort({ createdAt: -1 }).lean(),
  ]);

  const revenue = orders.reduce((accumulator, order) => {
    const sellerLines = order.items.filter((item) => item.seller.toString() === sellerId.toString());
    return (
      accumulator +
      sellerLines.reduce((lineAccumulator, line) => lineAccumulator + line.lineTotal, 0)
    );
  }, 0);

  const inventoryValue = products.reduce((accumulator, product) => {
    return accumulator + product.stock * product.price;
  }, 0);

  return {
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
      revenue,
      inventoryValue,
    },
    products: products.slice(0, 12),
    recentOrders: orders.slice(0, 12),
  };
};

