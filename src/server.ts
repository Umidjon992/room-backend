import mongoose from "mongoose";
import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDb();
  // 0.0.0.0 so the container/host platform can reach the process
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on http://localhost:${env.PORT}/api`);
  });

  const shutdown = () => {
    server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start server:", err.message ?? err);
  process.exit(1);
});
