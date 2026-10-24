import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimit";
import routes from "./routes";

export const app = express();

// Behind Render/Railway/Nginx the real client IP comes from X-Forwarded-For; needed for correct rate limiting.
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGINS,
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "x-host-key"],
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use("/api", generalLimiter, routes);
app.use(notFound);
app.use(errorHandler);
