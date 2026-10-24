import { randomUUID } from "node:crypto";
import { Room } from "../models/Room";
import { HttpError } from "../utils/httpError";
import { generateHostKey, generateRoomId, hashKey, keyMatchesHash } from "../utils/ids";
import { deleteLiveKitRoom } from "./livekitService";

export function toPublicRoom(room: { roomId: string; name?: string | null; status: string; createdAt: Date; endedAt?: Date | null }) {
  return {
    roomId: room.roomId,
    name: room.name ?? null,
    status: room.status,
    createdAt: room.createdAt,
    endedAt: room.endedAt ?? null,
  };
}

export async function createRoom(name?: string) {
  const hostKey = generateHostKey();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const room = await Room.create({
        roomId: generateRoomId(),
        name,
        createdBy: randomUUID(),
        hostKeyHash: hashKey(hostKey),
      });
      return { room, hostKey };
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err; // retry only on duplicate roomId
    }
  }
  throw new HttpError(500, "Не удалось создать комнату, попробуйте ещё раз");
}

export async function findRoom(roomId: string) {
  const room = await Room.findOne({ roomId }).select("+hostKeyHash");
  if (!room) throw new HttpError(404, "Комната не найдена");
  return room;
}

export async function findActiveRoom(roomId: string) {
  const room = await findRoom(roomId);
  if (room.status !== "active") throw new HttpError(410, "Эта комната уже завершена");
  return room;
}

export async function endRoom(roomId: string, hostKey: string | undefined) {
  const room = await findRoom(roomId);
  if (!keyMatchesHash(hostKey, room.hostKeyHash)) {
    throw new HttpError(403, "Только создатель комнаты может завершить звонок");
  }
  if (room.status === "active") {
    room.status = "ended";
    room.endedAt = new Date();
    await room.save();
  }
  // Disconnects everyone still connected; failure here must not undo the status change.
  await deleteLiveKitRoom(roomId).catch((err) => console.warn("LiveKit deleteRoom failed:", err?.message ?? err));
  return room;
}
