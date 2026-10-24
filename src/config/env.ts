import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // One URL, or several separated by commas (e.g. production + preview domains)
  FRONTEND_URL: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  LIVEKIT_URL: z.string().regex(/^(wss?|https?):\/\//, "must start with wss:// or ws://"),
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("Copy backend/.env.example to backend/.env and fill in the values.");
  process.exit(1);
}

const FRONTEND_ORIGINS = parsed.data.FRONTEND_URL.split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (FRONTEND_ORIGINS.some((o) => !URL.canParse(o))) {
  console.error("FRONTEND_URL must contain valid URLs, e.g. https://meet.example.com");
  process.exit(1);
}

export const env = {
  ...parsed.data,
  FRONTEND_ORIGINS,
  // Used to build invite links
  FRONTEND_URL: FRONTEND_ORIGINS[0],
};
