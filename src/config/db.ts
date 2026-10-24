import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env";

const connect = () => mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

export async function connectDb(): Promise<void> {
  try {
    await connect();
  } catch (err) {
    // Some ISPs/routers/VPNs refuse DNS SRV lookups, which mongodb+srv:// needs.
    // Retry once with public DNS for this Node process only.
    if ((err as { syscall?: string }).syscall !== "querySrv") throw err;
    console.warn("System DNS can't resolve the MongoDB SRV record, retrying with 8.8.8.8 / 1.1.1.1");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await connect();
  }
  console.log("MongoDB connected");
}
