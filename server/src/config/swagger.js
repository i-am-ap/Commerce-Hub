import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Commerce Hub API",
    version: "1.0.0",
    description:
      "Production-oriented e-commerce REST API with customer, seller, and admin workflows.",
  },
  servers: [
    {
      url: "/api",
      description: "Relative API base path",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          isSellerApproved: { type: "boolean" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          price: { type: "number" },
          stock: { type: "number" },
          averageRating: { type: "number" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string" },
          orderStatus: { type: "string" },
          paymentStatus: { type: "string" },
          total: { type: "number" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new customer or seller",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registered successfully",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Log a user in and issue cookies",
        responses: {
          200: {
            description: "Logged in successfully",
          },
        },
      },
    },
    "/products": {
      get: {
        summary: "List products with search, filters, sort, and pagination",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Product collection",
          },
        },
      },
      post: {
        summary: "Create a product as an approved seller",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Product created" },
        },
      },
    },
    "/cart": {
      get: {
        summary: "Fetch active cart",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Cart details" },
        },
      },
    },
    "/orders/checkout": {
      post: {
        summary: "Create an order from the current cart",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Order created" },
        },
      },
    },
    "/admin/dashboard": {
      get: {
        summary: "Get admin analytics dashboard",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Admin analytics payload" },
        },
      },
    },
  },
};

export const swaggerMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
  }),
];

