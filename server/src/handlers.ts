import { ServerWebSocket } from "bun";
import { campaigns } from "./campaigns";
import randomstring from "randomstring";
import { JoinData } from "./types";
import { findPlayerByName, loadCampaigns, saveCampaign } from "./utils";

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

export function closeCampaign(ws: ServerWebSocket, campaignCode: string){
    const campaign = campaigns.get(campaignCode);

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

export function joinCampaign(ws: ServerWebSocket, data: JoinData){
    const campaign = campaigns.get(data.campaignCode);

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
            message: "Campaign not currently hosted"
        }));
        return;
    }
    
    const player = findPlayerByName(campaign, data.playerName)

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