import { type Inventory, type Item } from "../../../shared/src/types";

let socket: WebSocket;

export function connect() {
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = console.log("Connected");
    socket.onmessage = (e: MessageEvent) => console.log(`${JSON.parse(e.data).type}: ${JSON.parse(e.data).message}`);
}

//#region CAMPAIGN
export function createCampaign(){
    socket.send(JSON.stringify({
        type: "CREATE_CAMPAIGN"
    }));
}

export function hostCampaign(campaignCode: string){
    socket.send(JSON.stringify({
        type: "HOST_CAMPAIGN",
        campaignCode
    }));
}

export function joinCampaign(campaignCode: string, playerName: string){
    socket.send(JSON.stringify({
        type: "JOIN_CAMPAIGN",
        campaignCode,
        playerName
    }));
}

export function closeCampaign(campaignCode: string){
    socket.send(JSON.stringify({
        type: "CLOSE_CAMPAIGN",
        campaignCode
    }));
}

export function createPlayer(playerName: string, inventory: Inventory){
    socket.send(JSON.stringify({
        type: "CREATE_PLAYER",
        playerName,
        inventory
    }));
}
//#endregion

//#region INVENTORY
export function addItem(item: Item, playerId: number){
    socket.send(JSON.stringify({
        type: "ADD_ITEM",
        item,
        playerId
    }));
}

export function removeItem(item: Item, playerId: number){
    socket.send(JSON.stringify({
        type: "REMOVE_ITEM",
        item,
        playerId
    }));
}

export function dropitem(itemId: string, playerId: number, note: string){
    socket.send(JSON.stringify({
        type: "DROP_ITEM",
        itemId,
        playerId,
        note
    }));
}

export function pickUpItem(itemId: string, playerId: number){
    socket.send(JSON.stringify({
        type: "PICK_UP_ITEM",
        itemId,
        playerId,
    }));
}

export function moveItemBetweenContainers(direction: string, itemId: string, playerId: number, bagId: string){
    socket.send(JSON.stringify({
        type: "MOVE_ITEM",
        itemId,
        playerId,
        bagId,
        direction
    }));
}

export function transferItemToPlayer(itemId: string, giverPlayerId: number, getterPlayerId: number){
    socket.send(JSON.stringify({
        type: "TRANSFER_ITEM",
        itemId,
        giverPlayerId,
        getterPlayerId
    }))
}
//#endregion