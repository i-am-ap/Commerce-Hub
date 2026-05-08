import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
};

