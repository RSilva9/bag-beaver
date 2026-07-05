import { ServerWebSocket } from "bun";
import { DroppedItem, Player } from "../../shared/src/types";

export interface ConnectedPlayer {
    player: Player;
    ws: ServerWebSocket | null;
}

export interface Campaign {
    code: string;
    nextPlayerId: number;
    dm: ServerWebSocket | null;
    players: Map<number, ConnectedPlayer> | null;
    droppedItems: DroppedItem[];
    isHosted: boolean;
}