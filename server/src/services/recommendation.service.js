import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

const uniq = (items) => [...new Set(items.filter(Boolean))];

export const getRecommendationsForUser = async (userId, limit = 8) => {
  if (!userId) {
    return Product.find({ status: "published" })
      .sort({ featured: -1, soldCount: -1, averageRating: -1 })
      .limit(limit)
      .populate("category seller", "name slug")
      .lean();
  }

  const [user, recentOrders] = await Promise.all([
    User.findById(userId).lean(),
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const orderedCategories = recentOrders.flatMap((order) =>
    order.items.map((item) => item.category || "")
  );
  const orderedTitles = recentOrders.flatMap((order) => order.items.map((item) => item.title));
  const preferredTerms = user?.searchHistory?.flatMap((entry) => [entry.term, entry.category]) || [];
  const categorySignals = uniq([...orderedCategories, ...(user?.interests || []), ...preferredTerms]);
  const titleSignals = uniq(orderedTitles);

  const query = {
    status: "published",
    $or: [],
  };

  if (categorySignals.length) {
    query.$or.push({ tags: { $in: categorySignals } });
    query.$or.push({ searchKeywords: { $in: categorySignals } });
  }

  if (titleSignals.length) {
    query.$or.push({ title: { $regex: titleSignals.join("|"), $options: "i" } });
  }

  if (!query.$or.length) {
    delete query.$or;
  }

  const products = await Product.find(query)
    .sort({ featured: -1, averageRating: -1, soldCount: -1 })
    .limit(limit)
    .populate("category seller", "name slug")
    .lean();

  if (products.length >= limit) {
    return products;
  }

  const fallback = await Product.find({
    status: "published",
    _id: { $nin: products.map((product) => product._id) },
  })
    .sort({ featured: -1, soldCount: -1 })
    .limit(limit - products.length)
    .populate("category seller", "name slug")
    .lean();

  return [...products, ...fallback];
};

