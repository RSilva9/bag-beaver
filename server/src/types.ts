import { ServerWebSocket } from "bun";
import { Player } from "../../shared/src/types";

export interface JoinData {
    campaignCode: string;
    playerName: string;
}

export interface ConnectedPlayer {
    player: Player;
    ws: ServerWebSocket<unknown> | null;
}

export interface CampaignData {
    code: string;
    nextPlayerId: number;
    players: Player[];
}

export interface Campaign {
    code: string;
    nextPlayerId: number;
    dm: ServerWebSocket<unknown> | null;
    players: Map<number, ConnectedPlayer> | null;
    isHosted: boolean;
}