import Razorpay from "razorpay";
import Stripe from "stripe";

import { env } from "../config/env.js";

const stripeClient = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;
const razorpayClient =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret,
      })
    : null;

export const createPaymentIntent = async ({
  amount,
  currency = "inr",
  provider = "cod",
  metadata = {},
  receipt = `receipt_${Date.now()}`,
}) => {
  const normalizedAmount = Math.round(Number(amount) * 100);

  if (provider === "stripe" && stripeClient) {
    const intent = await stripeClient.paymentIntents.create({
      amount: normalizedAmount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      provider: "stripe",
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      paymentStatus: "pending",
    };
  }

  if (provider === "razorpay" && razorpayClient) {
    const order = await razorpayClient.orders.create({
      amount: normalizedAmount,
      currency: currency.toUpperCase(),
      receipt,
      notes: metadata,
    });

    return {
      provider: "razorpay",
      paymentIntentId: order.id,
      clientSecret: order.id,
      paymentStatus: "pending",
    };
  }

  return {
    provider: "cod",
    paymentIntentId: `cod_${Date.now()}`,
    clientSecret: "",
    paymentStatus: "pending",
  };
};

