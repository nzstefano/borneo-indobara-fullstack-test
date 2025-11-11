import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errors.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: env.corsOrigin, credentials: false }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.use("/", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
