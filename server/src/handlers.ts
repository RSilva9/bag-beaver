import { ServerWebSocket } from "bun";
import { campaigns, connections } from "./campaigns";
import randomstring from "randomstring";
import { getPlayerByName, saveCampaign, getPlayerById, updateInventoryForPlayerAndDM, getCampaignByCode, getPlayerSocketById, getDMSocket, getInventoryLoad } from "./utils";
import { Item, Player } from "../../shared/src/types";
import { Connection } from "./types";
import { Campaign } from "../../shared/src/types";

//#region CAMPAIGNS
export function createCampaign(name: string){
    let campaignCode;
    do{
        campaignCode = randomstring.generate({length: 5, charset: "alphanumeric"});
    }
    while(campaigns.has(campaignCode));

    const campaign: Campaign = {
        code: campaignCode,
        name,
        dmSecret: randomstring.generate({length: 5, charset: "alphanumeric"}),
        nextPlayerId: 1,
        players: [],
        droppedItems: []
    }
    
    campaigns.set(campaignCode, campaign);

    saveCampaign(campaign);
}

export function getCampaigns(ws: ServerWebSocket){
    ws.send(JSON.stringify({
        type: "CAMPAIGN_LIST",
        campaigns: Array.from(campaigns.values())
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

    ws.send(JSON.stringify({
        type: "CAMPAIGN_JOINED",
        player
    }));
    broadcastPlayerList(campaign);
}

export function joinCampaignAsDM(ws: ServerWebSocket, campaignCode: string, dmSecret: string){
    const campaign = getCampaignByCode(campaignCode);
    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found"
        }));
        return;
    }

    if(campaign.dmSecret !== dmSecret){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Invalid DM secret."
        }));
        return;
    }

    const connection: Connection = {
        ws,
        campaignCode,
        playerId: -1,
        role: "DM"
    }

    connections.set(ws, connection);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_JOINED_DM",
        campaign
    }))
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

    campaign.players = 
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

    const { used, max } = getInventoryLoad(player.inventory);
    if(used + item.size > max){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Target player doesn't have enough capacity"
        }));
        return;
    }
    
    item.id = randomstring.generate({ length: 8, charset: "alphanumeric" })
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
        player.inventory.items.filter(i => i.id !== itemId);

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

    const connection = connections.get(ws);
    if(!connection || connection.role !== "DM"){
        ws.send(JSON.stringify({ 
            type: "ERROR", 
            message: "Unauthorized, only the DM may assign dropped items." 
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

    const { used, max } = getInventoryLoad(player.inventory);
    if(used + pickedUpItem.size > max){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Target player doesn't have enough capacity"
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

    if (item && bag && bag.inventory) {
        const { used, max } = getInventoryLoad(bag.inventory);
        if(used + item.size > max){
            ws.send(JSON.stringify({
                type: "ERROR",
                message: "The selected bag doesn't have enough capacity"
            }));
            return;
        }

        player.inventory.items =
            player.inventory.items.filter(i => i.id !== itemId);
        bag.inventory.items.push(item!);
    }

    saveCampaign(campaign);
    
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
    
    if (item && bag && bag.inventory) {
        const { used, max } = getInventoryLoad(player.inventory);
        if(used + item.size > max){
            ws.send(JSON.stringify({
                type: "ERROR",
                message: "Player inventory doesn't have enough capacity"
            }));
            return;
        }

        bag.inventory.items = bag.inventory.items.filter(i => i.id !== itemId);
        player.inventory.items.push(item!);
    }

    saveCampaign(campaign);

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
    if(!item){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Item not found."
        }));
        return;
    }

    const { used, max } = getInventoryLoad(getterPlayer.inventory);
    if(used + item.size > max){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Target player doesn't have enough capacity"
        }));
        return;
    }

    giverPlayer.inventory.items =
        giverPlayer.inventory.items.filter(i => i.id !== itemId);
    getterPlayer.inventory.items.push(item!);

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(giverPlayerId, campaignCode, giverPlayer.inventory);
    updateInventoryForPlayerAndDM(getterPlayerId, campaignCode, getterPlayer.inventory);
}

export function broadcastCapacity(playerId: number, load: { used: number; max: number }, campaignCode: string){
    for(const [ws, conn] of connections){
        if(conn.campaignCode === campaignCode){
            ws.send(JSON.stringify({
                type: "CAPACITY_UPDATED",
                playerId,
                used: load.used,
                max: load.max
            }))
        }
    }
}

function broadcastPlayerList(campaign: Campaign){
    const players = campaign.players
        .filter(p => p.role !== "DM")
        .map(p => {
            const { used, max } = getInventoryLoad(p.inventory);
            return { id: p.id, name: p.name, used, max };
        });

    for(const [ws, conn] of connections){
        if(conn.campaignCode === campaign.code){
            ws.send(JSON.stringify({ type: "PLAYER_LIST", players }));
        }
    }
}

export function changeItemSize(ws: ServerWebSocket, playerId: number, itemId: string, newSize: number, campaignCode: string){
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
    if(!item){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Item not found."
        }));
        return;
    }

    item.size = newSize;

    saveCampaign(campaign);

    updateInventoryForPlayerAndDM(playerId, campaignCode, player.inventory);
}

//#endregion