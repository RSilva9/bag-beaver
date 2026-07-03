export interface Item {
    name: string
    description: string
    size: number
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