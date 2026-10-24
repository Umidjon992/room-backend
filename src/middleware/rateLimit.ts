import { rateLimit } from "express-rate-limit";

const make = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, error: { message } });
    },
  });

export const createRoomLimiter = make(60 * 60 * 1000, 20, "Слишком много созданных комнат. Попробуйте позже.");
export const tokenLimiter = make(5 * 60 * 1000, 60, "Слишком много попыток входа. Подождите несколько минут.");
export const generalLimiter = make(60 * 1000, 300, "Слишком много запросов. Подождите минуту.");
