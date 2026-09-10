import { ServerWebSocket } from "bun";
import { DroppedItem, Player } from "../../shared/src/types";

export interface Connection {
    ws: ServerWebSocket;
    campaignCode: string;
    playerId?: number;
    role: "PLAYER" | "DM";
}