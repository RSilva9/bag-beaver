import { Inventory, Item, Player } from "./types";
import { Campaign } from "./types";

export interface ClientToServer {
    // CAMPAIGN
    CREATE_CAMPAIGN: {};
    GET_CAMPAIGNS: {};
    JOIN_CAMPAIGN: {
        campaignCode: string;
        playerName: string;
    };
    JOIN_CAMPAIGN_AS_DM: {
        campaignCode: string;
        dmSecret: string;
    };

    // PLAYER
    CREATE_PLAYER: {
        playerData: Player;
        campaignCode: string;
    };
    DELETE_PLAYER: {
        playerId: number;
        campaignCode: string;
    };

    // INVENTORY
    ADD_ITEM: {
        item: Item;
        playerId: number;
        campaignCode: string;
    };
    REMOVE_ITEM: {
        itemId: string;
        playerId: number;
        campaignCode: string;
    };
    DROP_ITEM: {
        itemId: string;
        playerId: number;
        note: string;
        campaignCode: string;
    };
    PICK_UP_ITEM: {
        itemId: string;
        playerId: number;
        campaignCode: string;
    };
    MOVE_ITEM: {
        itemId: string;
        playerId: number;
        bagId: string;
        direction: string;
        campaignCode: string;
    };
    TRANSFER_ITEM: {
        itemId: string;
        giverPlayerId: number;
        getterPlayerId: number;
        campaignCode: string;
    };
    CHANGE_ITEM_SIZE: {
        playerId: number;
        itemId: string;
        newSize: number;
        campaignCode: string;
    };
}

export interface ServerToClient {
    // CAMPAIGN
    CAMPAIGN_LIST:{
        campaings: Campaign[]
    };
    CAMPAIGN_JOINED: {
        player: Player;
    };
    CAMPAIGN_JOINED_DM: {
        campaign: Campaign;
    };

    // PLAYER
    PLAYER_CREATED: {
        player: Player;
    };
    PLAYER_DELETED: {};

    // INVENTORY
    INVENTORY_SYNC: {
        inventory: Inventory;
    };
    CAPACITY_UPDATED: {
        playerId: number,
        used: number,
        max: number
    }

    // GENERAL
    ERROR: {
        message: string;
    };
}