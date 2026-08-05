export interface Item {
    id: string;
    name: string;
    description: string;
    size: number;
    inventory?: Inventory;
}

export interface DroppedItem {
    item: Item;
    note: string;
}

export interface Inventory {
    capacity: number;
    items: Item[];
}

export interface Player {
    id: number;
    name: string;
    inventory: Inventory;
}

export interface CampaignData {
    code: string;
    nextPlayerId: number;
    players: Player[];
    droppedItems: DroppedItem[];
}