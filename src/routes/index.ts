import { Router } from "express";
import * as rooms from "../controllers/roomController";
import { createRoomLimiter, tokenLimiter } from "../middleware/rateLimit";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

router.post("/rooms", createRoomLimiter, rooms.create);
router.get("/rooms/:roomId", rooms.get);
router.post("/rooms/:roomId/token", tokenLimiter, rooms.issueToken);
router.delete("/rooms/:roomId", rooms.end);

export default router;
