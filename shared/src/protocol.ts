import { Inventory, Player } from "./types";
import { ConnectedPlayer } from "../../server/src/types";

export interface ClientToServer {
    CREATE_CAMPAIGN: {};
    JOIN_CAMPAIGN: {
        code: string;
        player: ConnectedPlayer;
    };
    REQUEST_USE_ITEM: {
        itemId: string;
    }
}

export interface ServerToClient {
    CAMPAIGN_CREATED: {
        code: string
    };
    CAMPAIGN_JOINED: {
        player: Player
    };
    INVENTORY_SYNC: {
        inventory: Inventory;
    };
    ERROR: {
        message: string;
    };
}