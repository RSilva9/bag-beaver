import { Inventory, Player } from "./types";
import { Campaign, ConnectedPlayer } from "../../server/src/types";

export interface ClientToServer {
    CREATE_CAMPAIGN: {};
    HOST_CAMPAIGN: {
        campaignCode: string;
    };
    CLOSE_CAMPAIGN: {};
    JOIN_CAMPAIGN: {
        campaignCode: string;
        player: ConnectedPlayer;
    };
    CREATE_PLAYER: {
        player: Player;
    };
    DELETE_PLAYER: {
        playerId: number;
    };
    USE_ITEM: {
        itemId: string;
    };
    DROP_ITEM: {
        itemId: string;
        playerId: number;
        note: string;
    };
    MOVE_ITEM: {
        itemId: string;
        playerId: number;
        bagId: string;
        direction: string;
    };
    TRANSFER_ITEM: {
        itemId: string;
        giverPlayerId: number;
        getterPlayerId: number;
    }
}

export interface ServerToClient {
    CAMPAIGN_CREATED: {
        code: string;
    };
    CAMPAIGN_JOINED: {
        player: Player;
    };
    CAMPAIGN_HOSTED: {
        campaign: Campaign;
    };
    CAMPAIGN_CLOSED: {};
    PLAYER_CREATED: {
        player: ConnectedPlayer;
    };
    PLAYER_DELETED: {};
    INVENTORY_SYNC: {
        inventory: Inventory;
    };
    ERROR: {
        message: string;
    };
}