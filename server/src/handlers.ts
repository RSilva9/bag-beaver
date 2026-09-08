import { ServerWebSocket } from "bun";
import { campaigns, connections } from "./campaigns";
import randomstring from "randomstring";
import { getPlayerByName, saveCampaign, getPlayerById, updateInventoryForPlayerAndDM, getCampaignByCode, getPlayerSocketById, getDMSocket } from "./utils";
import { Item, Player } from "../../shared/src/types";
import { Campaign, Connection } from "./types";

//#region CAMPAIGNS
export function createCampaign(){
    let campaignCode;
    do{
        campaignCode = randomstring.generate({length: 5, charset: "alphanumeric"});
    }
    while(campaigns.has(campaignCode));

    const campaign: Campaign = {
        code: campaignCode,
        dmSecret: randomstring.generate({length: 5, charset: "alphanumeric"}),
        nextPlayerId: 1,
        players: [],
        droppedItems: []
    }
    
    campaigns.set(campaignCode, campaign);

    saveCampaign(campaign);
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

    const player = getPlayerByName(campaign, playerName)

    if(player === undefined){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "You are not a member of this campaign's party."
        }));
        return;
    };

    const connection: Connection = {
        ws,
        campaignCode,
        playerId: player.id,
        role: player.role
    };

    connections.set(ws, connection);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_JOINED",
        player: player
    }));
}
//#endregion

//#region PLAYERS
export function createPlayer(ws: ServerWebSocket, playerData: Player, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }

    const id: number = campaign.nextPlayerId++;
    playerData.id = id;

    campaign.players.push(playerData);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "PLAYER_CREATED",
        player: playerData
    }));
}

export function deletePlayer(ws: ServerWebSocket, playerId: number, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found."
        }));
        return;
    }
    
    const deletedPlayer = getPlayerById(campaign, playerId);
    if(!deletedPlayer){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Player not found."
        }));
        return;
    }

    campaign.players.filter(p => p.id !== playerId);
    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "PLAYER_DELETED"
    }));
}
//#endregion

//#region ITEMS
export function addItem(ws: ServerWebSocket, item: Item, playerId: number, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);

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

    if(player.role !== "DM"){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Unauthorized, only the DM may add items."
        }));
        return;
    }

    player.inventory.items.push(item);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function removeItem(ws: ServerWebSocket, itemId: string, playerId: number, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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

    player.inventory.items =
        player.inventory.items.filter(i => i.id !== itemId);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function dropItem(ws: ServerWebSocket, itemId: string, playerId: number, note: string, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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

    const droppedItem = player.inventory.items.find(i => i.id === itemId);
    if(!droppedItem){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Item not found."
        }));
        return;
    }

    player.inventory.items =
        player.inventory.items.filter(i => i !== droppedItem);

    campaign.droppedItems.push({
        item: droppedItem,
        note
    });

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function pickUpItem(ws: ServerWebSocket, itemId: string, playerId: number, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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
    
    player.inventory.items.push(pickedUpItem);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function moveItemIntoBag(ws: ServerWebSocket, itemId: string, playerId: number, bagId: string, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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

    const item = player.inventory.items.find(i => i.id === itemId);
    const bag = player.inventory.items.find(i => i.id === bagId);

    player.inventory.items =
        player.inventory.items.filter(i => i !== item);
    if (bag && bag.inventory) {
        bag.inventory.items.push(item!);
    }
    
    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function moveItemOutOfBag(ws: ServerWebSocket, itemId: string, playerId: number, bagId: string, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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

    const item = player.inventory.items.find(i => i.id === itemId);
    const bag = player.inventory.items.find(i => i.id === bagId);

    if (bag && bag.inventory) {
        bag.inventory.items = bag.inventory.items.filter(i => i !== item);
    }
    player.inventory.items.push(item!);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

export function transferItem(ws: ServerWebSocket, itemId: string, giverPlayerId: number, getterPlayerId: number, campaignCode: string){
    const campaign = getCampaignByCode(campaignCode);
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

    const item = giverPlayer.inventory.items.find(i => i.id === itemId);

    giverPlayer.inventory.items =
        giverPlayer.inventory.items.filter(i => i !== item);
    getterPlayer.inventory.items.push(item!);

    updateInventoryForPlayerAndDM(giverPlayerId, campaignCode, giverPlayer.inventory);
    updateInventoryForPlayerAndDM(getterPlayerId, campaignCode, getterPlayer.inventory);
}
//#endregion