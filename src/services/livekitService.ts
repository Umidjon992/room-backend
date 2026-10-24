import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { env } from "../config/env";

const TOKEN_TTL = "2h";

const httpUrl = env.LIVEKIT_URL.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
const roomService = new RoomServiceClient(httpUrl, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

interface TokenParams {
  roomId: string;
  identity: string;
  name: string;
  isHost: boolean;
}

// The grant is fixed on the server: join one room, publish/subscribe/chat. No admin, record or hidden rights.
export async function createParticipantToken({ roomId, identity, name, isHost }: TokenParams): Promise<string> {
  const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: TOKEN_TTL,
    metadata: JSON.stringify({ isHost }),
  });
  token.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: false,
  });
  return token.toJwt();
}

export async function deleteLiveKitRoom(roomId: string): Promise<void> {
  await roomService.deleteRoom(roomId);
}
