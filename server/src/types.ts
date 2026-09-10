import { ServerWebSocket } from "bun";

export interface Connection {
    ws: ServerWebSocket;
    campaignCode: string;
    playerId?: number;
    role: "PLAYER" | "DM";
}