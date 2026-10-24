import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

// No look-alike letters (i, l, o); ~24^10 combinations, not guessable by brute force under rate limits.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz";
export const ROOM_ID_REGEX = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;

function chunk(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export const generateRoomId = () => `${chunk(3)}-${chunk(4)}-${chunk(3)}`;
export const generateHostKey = () => randomBytes(32).toString("hex");
export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

export function keyMatchesHash(key: string | undefined, hash: string): boolean {
  if (!key) return false;
  return timingSafeEqual(Buffer.from(hashKey(key)), Buffer.from(hash));
}
