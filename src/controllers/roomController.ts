import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "../config/env";
import { createParticipantToken } from "../services/livekitService";
import { createRoom, endRoom, findActiveRoom, findRoom, toPublicRoom } from "../services/roomService";
import { keyMatchesHash, ROOM_ID_REGEX } from "../utils/ids";
import { HttpError } from "../utils/httpError";

const roomIdSchema = z.string().regex(ROOM_ID_REGEX, "Некорректный код комнаты");
const createSchema = z.object({ name: z.string().trim().max(60, "Название слишком длинное").optional() });
const tokenSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(40, "Имя слишком длинное"),
  hostKey: z.string().max(128).optional(),
});

const parseRoomId = (req: Request) => roomIdSchema.parse(req.params.roomId);

export async function create(req: Request, res: Response) {
  const { name } = createSchema.parse(req.body ?? {});
  const { room, hostKey } = await createRoom(name || undefined);
  res.status(201).json({
    success: true,
    data: { room: toPublicRoom(room), hostKey, link: `${env.FRONTEND_URL}/room/${room.roomId}` },
  });
}

export async function get(req: Request, res: Response) {
  const room = await findRoom(parseRoomId(req));
  res.json({ success: true, data: { room: toPublicRoom(room) } });
}

export async function issueToken(req: Request, res: Response) {
  const roomId = parseRoomId(req);
  const { name, hostKey } = tokenSchema.parse(req.body ?? {});
  const room = await findActiveRoom(roomId);
  const isHost = keyMatchesHash(hostKey, room.hostKeyHash);
  const token = await createParticipantToken({ roomId, identity: randomUUID(), name, isHost });
  res.json({ success: true, data: { token, serverUrl: env.LIVEKIT_URL, isHost } });
}

export async function end(req: Request, res: Response) {
  const hostKey = req.header("x-host-key") ?? undefined;
  if (!hostKey) throw new HttpError(403, "Только создатель комнаты может завершить звонок");
  const room = await endRoom(parseRoomId(req), hostKey);
  res.json({ success: true, data: { room: toPublicRoom(room) } });
}
