import { ServerWebSocket } from "bun";
import { campaigns } from "./campaigns";
import randomstring from "randomstring";
import { ConnectedPlayer } from "./types";
import { getPlayerByName, getCurrentCampaign, saveCampaign, getPlayerById, updateInventoryForPlayerAndDM } from "./utils";
import { Item, Player } from "../../shared/src/types";

//#region CAMPAIGNS
export function createCampaign(ws: ServerWebSocket){
    let campaignCode;
    do{
        campaignCode = randomstring.generate({length: 5, charset: "alphanumeric"});
    }
    while(campaigns.has(campaignCode));

    const campaign = {
        code: campaignCode,
        nextPlayerId: 1,
        dm: ws,
        players: new Map(),
        droppedItems: [],
        isHosted: false
    }
    
    campaigns.set(campaignCode, campaign);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_CREATED",
        campaign
    }));
}

export function hostCampaign(ws: ServerWebSocket, campaignCode: string){
    const campaign = campaigns.get(campaignCode);
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found"
        }));
        return;
    }

    campaign.isHosted = true;
    campaign.dm = ws;

    ws.send(JSON.stringify({
        type: "CAMPAIGN_HOSTED",
        campaign
    }));
}

export function closeCampaign(ws: ServerWebSocket){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found"
        }));
        return;
    }

    campaign.isHosted = false;
    campaign.dm = null;
    campaign.players?.forEach(p => p.ws = null);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_CLOSED",
        campaign
    }));
}

export function joinCampaign(ws: ServerWebSocket, campaignCode: string, playerName: string){
    const campaign = campaigns.get(campaignCode);
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found"
        }));
        return;
    }

    if(campaign.isHosted === false){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not currently hosted."
        }));
        return;
    }
    
    const player = getPlayerByName(campaign, playerName)

    if(player === undefined){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "You are not a member of this campaign's party."
        }));
        return;
    }

    player.ws = ws;

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_JOINED",
        player: player.player
    }));
}
//#endregion

//#region PLAYERS
export function createPlayer(ws: ServerWebSocket, playerData: Player): ConnectedPlayer | null{
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return null;
    }

    const id: number = campaign.nextPlayerId++;
    const connectedPlayer: ConnectedPlayer = {
        player: {
            id,
            name: playerData.name,
            inventory: playerData.inventory
        },
        ws: null
    };

    campaign.players!.set(id, connectedPlayer);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "PLAYER_CREATED",
        player: connectedPlayer
    }));

    return connectedPlayer;
}

export function deletePlayer(ws: ServerWebSocket, playerId: number){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }
    
    const deletedPlayer = campaign.players?.delete(playerId);
    if(!deletedPlayer){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Failed to delete player from campaign."
        }));
        return;
    }

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "PLAYER_DELETED"
    }));
}
//#endregion

//#region ITEMS
export function addItem(ws: ServerWebSocket, item: Item, playerId: number){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    if(ws !== campaign.dm){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Unauthorized, only the DM may add items."
        }));
        return;
    }

    player.player.inventory.items.push(item);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function removeItem(ws: ServerWebSocket, itemId: string, playerId: number){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    player.player.inventory.items =
        player.player.inventory.items.filter(i => i.id !== itemId);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function dropItem(ws: ServerWebSocket, itemId: string, playerId: number, note: string){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    const droppedItem = player.player.inventory.items.find(i => i.id === itemId);

    player.player.inventory.items =
        player.player.inventory.items.filter(i => i !== droppedItem);

    if(!droppedItem){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Item not found."
        }));
        return;
    }
    campaign.droppedItems.push({
        item: droppedItem,
        note
    });

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function pickUpItem(ws: ServerWebSocket, itemId: string, playerId: number){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    const pickedUpItem = campaign.droppedItems.find(i => i.item.id === itemId)?.item;

    if(!pickedUpItem){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Item not found."
        }));
        return;
    }
    
    player.player.inventory.items.push(pickedUpItem);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function moveItemIntoBag(ws: ServerWebSocket, itemId: string, playerId: number, bagId: string){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    const item = player.player.inventory.items.find(i => i.id === itemId);
    const bag = player.player.inventory.items.find(i => i.id === bagId);

    player.player.inventory.items =
        player.player.inventory.items.filter(i => i.id !== itemId);
    if (bag && bag.inventory) {
        bag.inventory.items.push(item!);
    }
    
    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function moveItemOutOfBag(ws: ServerWebSocket, itemId: string, playerId: number, bagId: string){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const player = getPlayerById(campaign, playerId);
    if(!player){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    const item = player.player.inventory.items.find(i => i.id === itemId);
    const bag = player.player.inventory.items.find(i => i.id === bagId);

    if (bag && bag.inventory) {
        bag.inventory.items = bag.inventory.items.filter(i => i !== item);
    }
    player.player.inventory.items.push(item!);

    updateInventoryForPlayerAndDM(player.ws!, campaign.dm!, player.player.inventory);
}

export function transferItem(ws: ServerWebSocket, itemId: string, giverPlayerId: number, getterPlayerId: number){
    const campaign = getCurrentCampaign();
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }
    const giverPlayer = getPlayerById(campaign, giverPlayerId);
    const getterPlayer = getPlayerById(campaign, getterPlayerId);
    if(!giverPlayer || !getterPlayer){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Transfer failed."
        }));
        return;
    }

    const item = giverPlayer.player.inventory.items.find(i => i.id === itemId);

    giverPlayer.player.inventory.items =
        giverPlayer.player.inventory.items.filter(i => i !== item);
    getterPlayer.player.inventory.items.push(item!);

    updateInventoryForPlayerAndDM(giverPlayer.ws!, campaign.dm!, giverPlayer.player.inventory);
    updateInventoryForPlayerAndDM(getterPlayer.ws!, campaign.dm!, getterPlayer.player.inventory);
}
//#endregion