import { Inventory, Player } from "./types";
import { Campaign, ConnectedPlayer } from "../../server/src/types";

export interface ClientToServer {
    CREATE_CAMPAIGN: {};
    HOST_CAMPAIGN: {
        campaignCode: string;
    };
    CLOSE_CAMPAIGN: {
        campaignCode: string;
    }
    JOIN_CAMPAIGN: {
        campaignCode: string;
        player: ConnectedPlayer;
    };
    REQUEST_USE_ITEM: {
        itemId: string;
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
    CAMPAIGN_CLOSED: {}
    INVENTORY_SYNC: {
        inventory: Inventory;
    };
    ERROR: {
        message: string;
    };
}