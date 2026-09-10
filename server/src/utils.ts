import { campaigns, connections } from "./campaigns";
import { Campaign } from "../../shared/src/types";
import fs from "fs";
import { Inventory, Item, Player } from "../../shared/src/types";
import { broadcastCapacity } from "./handlers";

export function getPlayerByName(campaign: Campaign, playerName: string): Player | undefined {
    if(!campaign.players){
        console.error("No players found")
        return;
    }

    const foundPlayer = campaign.players.find(p => p.name === playerName);
    console.log(foundPlayer);

    return foundPlayer;
}

export function getPlayerById(campaign: Campaign, playerId: number): Player | undefined {
    if(!campaign.players){
        console.error("No players found.")
        return;
    }

    const foundPlayer = campaign.players.find(p => p.id === playerId);

    return foundPlayer;
}

export function getPlayerSocketById(playerId: number){
    const connection = connections.values().find(c => c.playerId === playerId);

    return connection!.ws;
}

export function getDMSocket(campaignCode: string){
    const connection = connections.values().find(c => c.role === "DM" && c.campaignCode === campaignCode);
    return connection!.ws;
}

export function saveCampaign(campaign: Campaign){
    fs.writeFile(`./campaigns/campaign-${campaign.code}.json`, JSON.stringify({
        code: campaign.code,
        nextPlayerId: campaign.nextPlayerId,
        players: campaign.players
    }, null, 4), "utf-8", (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

export function loadCampaigns(): Map<string, Campaign>{
    const campaignArray: Campaign[] = [];
    const filenames = fs.readdirSync("./campaigns");
    filenames.forEach(filename => {
        const content = fs.readFileSync(`./campaigns/${filename}`, "utf-8")
        campaignArray.push(JSON.parse(content));
    })
    return new Map<string, Campaign>(campaignArray.map(c => [c.code, c]));;
}

export function getCampaignByCode(campaignCode: string): Campaign | null{
    const campaign = campaigns.get(campaignCode);
    if(!campaign){
        console.error("Campaign could not be found!");
        return null;
    }
    return campaign;
}

export function updateInventoryForPlayerAndDM(playerId: number, campaignCode: string, inventory: Inventory){
    const playerSocket = getPlayerSocketById(playerId);
    const DMSocket = getDMSocket(campaignCode);

    if(playerSocket){
        playerSocket.send(JSON.stringify({
            type: "INVENTORY_SYNC",
            inventory
        }));
    }

    if(DMSocket){
        DMSocket.send(JSON.stringify({
            type: "INVENTORY_SYNC",
            inventory
        }));
    }

    broadcastCapacity(playerId, getInventoryLoad(inventory), campaignCode);
}

export function getInventoryLoad(inventory: Inventory): { used: number; max: number; } {
    const used = inventory.items.reduce((sum, item) => sum + item.size, 0);
    return { used, max: inventory.capacity };
}