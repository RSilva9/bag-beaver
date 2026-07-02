import { ServerWebSocket } from "bun";
import { campaigns } from "./campaigns";
import randomstring from "randomstring";
import { JoinData } from "./types";
import { createPlayer, findPlayerByName, loadCampaigns, saveCampaign } from "./utils";

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
        players: new Map()
    }
    
    campaigns.set(campaignCode, campaign);

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_CREATED",
        campaign
    }));
}

export function hostCampaign(ws: ServerWebSocket, campaignCode: string){
    
}

export function joinCampaign(ws: ServerWebSocket, data: JoinData){
    const campaign = campaigns.get(data.campaignCode);

    if(!campaign){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Campaign not found"
        }));
        return;
    }
    
    const player =
        findPlayerByName(campaign, data.playerName)
        ?? createPlayer(campaign, data.playerName);

    player.ws = ws;

    saveCampaign(campaign);

    ws.send(JSON.stringify({
        type: "CAMPAIGN_JOINED",
        player: player.player
    }))
}