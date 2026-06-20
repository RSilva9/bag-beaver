import { ServerWebSocket } from "bun";
import { Player } from "../../shared/src/types";

export interface JoinData {
    sessionCode: string;
    playerName: string;
}

export interface ConnectedPlayer {
    player: Player;
    ws?: ServerWebSocket<unknown>;
}

export interface SessionData {
    code: string;
    nextPlayerId: number;
    players: Player[];
}

export interface Session {
    code: string;
    nextPlayerId: number;
    dm: ServerWebSocket<unknown>;
    players: Map<number, ConnectedPlayer>;
}