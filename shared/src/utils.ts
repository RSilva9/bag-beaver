import { Inventory } from "./types";

export function calculateUsedCapacity(inventory: Inventory): number {
    const itemSizeSum = inventory.items.reduce((sum, item) => sum + item.size, 0);

    return itemSizeSum;
}