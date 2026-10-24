import { Schema, model, type InferSchemaType } from "mongoose";

const roomSchema = new Schema(
  {
    roomId: { type: String, required: true, unique: true },
    name: { type: String, trim: true, maxlength: 60 },
    createdBy: { type: String, required: true },
    // SHA-256 of the host key; the raw key is only ever shown to the creator once.
    hostKeyHash: { type: String, required: true, select: false },
    status: { type: String, enum: ["active", "ended"], default: "active", required: true },
    endedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type RoomDoc = InferSchemaType<typeof roomSchema>;
export const Room = model("Room", roomSchema);
