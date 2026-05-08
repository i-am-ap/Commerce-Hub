import { Client as ElasticsearchClient } from "@elastic/elasticsearch";

import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { getPagination } from "../utils/pagination.js";
import { getCache, setCache } from "./cache.service.js";

const elasticClient = env.elasticsearchNode
  ? new ElasticsearchClient({ node: env.elasticsearchNode })
  : null;

const buildMongoFilter = async (filters = {}) => {
  const query = {
    status: filters.status || "published",
  };

  if (filters.category) {
    const categoryClauses = [{ slug: filters.category }];

    if (mongoose.Types.ObjectId.isValid(filters.category)) {
      categoryClauses.push({ _id: filters.category });
    }

    const category = await Category.findOne({
      $or: categoryClauses,
    });

    if (category) {
      query.category = category._id;
    }
  }

  if (filters.tags?.length) {
    query.tags = { $in: filters.tags };
  }

  if (filters.featured !== undefined) {
    query.featured = filters.featured === true || filters.featured === "true";
  }

  if (filters.seller) {
    query.seller = filters.seller;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (filters.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: "i" } },
      { description: { $regex: filters.q, $options: "i" } },
      { tags: { $regex: filters.q, $options: "i" } },
    ];
  }

  return query;
};

const buildSort = (sort) => {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
      return { averageRating: -1, ratingCount: -1 };
    case "latest":
      return { createdAt: -1 };
    case "popular":
    default:
      return { featured: -1, soldCount: -1, createdAt: -1 };
  }
};

const tryElasticSearch = async (filters, pagination) => {
  if (!elasticClient || !filters.q) {
    return null;
  }

  try {
    const response = await elasticClient.search({
      index: "products",
      from: pagination.skip,
      size: pagination.limit,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: filters.q,
                fields: ["title^3", "description", "tags", "searchKeywords"],
                fuzziness: "AUTO",
              },
            },
          ],
        },
      },
      sort: [{ _score: "desc" }],
    });

    const hits = response.hits.hits || [];
    const ids = hits.map((hit) => hit._id);
    const products = await Product.find({ _id: { $in: ids } })
      .populate("category seller", "name slug avatar email")
      .lean();

    return {
      products: ids.map((id) => products.find((product) => product._id.toString() === id)).filter(Boolean),
      total: Number(response.hits.total?.value || hits.length),
    };
  } catch (error) {
    console.warn("ElasticSearch fallback engaged:", error.message);
    return null;
  }
};

export const listProducts = async (filters = {}) => {
  const pagination = getPagination(filters.page, filters.limit);
  const cacheKey = `products:${JSON.stringify({ ...filters, ...pagination })}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const elasticResults = await tryElasticSearch(filters, pagination);

  if (elasticResults) {
    const payload = {
      items: elasticResults.products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: elasticResults.total,
        pages: Math.ceil(elasticResults.total / pagination.limit) || 1,
      },
    };

    await setCache(cacheKey, payload, 45);
    return payload;
  }

  const query = await buildMongoFilter(filters);
  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(buildSort(filters.sort))
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("category seller", "name slug avatar email")
      .lean(),
    Product.countDocuments(query),
  ]);

  const payload = {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit) || 1,
    },
  };

  await setCache(cacheKey, payload, 45);
  return payload;
};

export const indexProduct = async (productDocument) => {
  if (!elasticClient) {
    return;
  }

  try {
    await elasticClient.index({
      index: "products",
      id: productDocument._id.toString(),
      document: {
        title: productDocument.title,
        description: productDocument.description,
        tags: productDocument.tags,
        searchKeywords: productDocument.searchKeywords,
        price: productDocument.price,
      },
      refresh: true,
    });
  } catch (error) {
    console.warn("ElasticSearch index skipped:", error.message);
  }
};

export const removeProductIndex = async (productId) => {
  if (!elasticClient) {
    return;
  }

  try {
    await elasticClient.delete({
      index: "products",
      id: productId.toString(),
      refresh: true,
    });
  } catch (error) {
    console.warn("ElasticSearch delete skipped:", error.message);
  }
};
