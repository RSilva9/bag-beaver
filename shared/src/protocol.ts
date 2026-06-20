import { Inventory, Player } from "./types";
import { ConnectedPlayer } from "../../server/src/types";

export interface ClientToServer {
    CREATE_SESSION: {};
    JOIN_SESSION: {
        code: string;
        player: ConnectedPlayer;
    };
    REQUEST_USE_ITEM: {
        itemId: string;
    }
}

export interface ServerToClient {
    SESSION_CREATED: {
        code: string
    };
    SESSION_JOINED: {
        player: Player
    };
    INVENTORY_SYNC: {
        inventory: Inventory;
    };
    ERROR: {
        message: string;
    };
}