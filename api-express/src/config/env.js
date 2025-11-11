import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpires: process.env.JWT_EXPIRES || "1h",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
};
