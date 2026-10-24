import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";
import { env } from "../config/env";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { message: "Маршрут не найден" } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: err.issues[0]?.message ?? "Некорректные данные",
        details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, error: { message: err.message, details: err.details } });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, error: { message: "Некорректный JSON" } });
    return;
  }
  console.error(err);
  res.status(500).json({
    success: false,
    error: { message: env.NODE_ENV === "production" ? "Внутренняя ошибка сервера" : String(err?.message ?? err) },
  });
};
