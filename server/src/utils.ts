import { ServerWebSocket } from "bun";
import { campaigns } from "./campaigns";
import { ConnectedPlayer, Campaign, CampaignData } from "./types";
import fs from "fs";


export function findPlayerByName(campaign: Campaign, playerName: string): ConnectedPlayer | undefined {
    if(!campaign.players){
        console.error("No players found")
        return;
    }
    const foundPlayer = [...campaign.players.values()]
        .find(p => p.player.name === playerName);

    return foundPlayer;
}

export function findPlayerBySocket(ws: ServerWebSocket): ConnectedPlayer | null {
    const currentCampaign = getCurrentCampaign();
    if(currentCampaign === null){
        return null;
    }
    for(const player of currentCampaign.players!.values()){
        if(player.ws === ws){
            return player;
        }
    }
    return null;
}

export function createPlayer(campaign: Campaign, playerName: string): ConnectedPlayer {
    const id: number = campaign.nextPlayerId++;
    const connectedPlayer: ConnectedPlayer = {
        player: {
            id,
            name: playerName,
            inventory: {
                capacity: 100,
                items: []
            }
        },
        ws: null
    };

    campaign.players!.set(id, connectedPlayer);

    return connectedPlayer;
}

export function saveCampaign(campaign: Campaign){
    fs.writeFile(`./campaigns/campaign-${campaign.code}.json`, JSON.stringify({
        code: campaign.code,
        nextPlayerId: campaign.nextPlayerId,
        players: [...campaign.players!.values()].map(p => p.player)
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
        campaignArray.push(campaignDataToCampaign(JSON.parse(content)));
    })
    return new Map<string, Campaign>(campaignArray.map(c => [c.code, c]));;
}

function campaignDataToCampaign(campaignData: CampaignData): Campaign{
    const playerList = new Map<number, ConnectedPlayer>(campaignData.players.map(p => 
        [   
            p.id, 
            {player: {
                id: p.id,
                name: p.name,
                inventory: p.inventory
            },
            ws: null
        }]))
    const convertedCampaign = {
        ...campaignData,
        dm: null,
        players: playerList,
        isHosted: false
    }

    return convertedCampaign;
}

function getCurrentCampaign(): Campaign | null {
    for(const campaign of campaigns.values()){
        if(campaign.isHosted){
            return campaign;
        }
    }

    return null;
}