import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useEffect } from "react";
import { useAppStore } from "./store";

export function useSocketConnection(){
    const setSendMessage = useAppStore(s => s.setSendMessage);
    const setError = useAppStore(s => s.setError);
    
    const setCampaigns = useAppStore(s => s.setCampaigns);
    const setDmCampaign = useAppStore(s => s.setDmCampaign);
    const setMyPlayer = useAppStore(s => s.setMyPlayer);
    const setCapacity = useAppStore(s => s.setCapacity);
    const setPlayerList = useAppStore(s => s.setPlayerList);
    const setInventory = useAppStore(s => s.setInventory);

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket("ws://localhost:3000", {
        shouldReconnect: () => true
    })

    useEffect(() => {
        setSendMessage(sendJsonMessage);
    }, [sendJsonMessage, setSendMessage]);

    useEffect(() => {
        if(!lastJsonMessage) return;
        const data = lastJsonMessage as any;

        switch(data.type){
            case "CAMPAIGN_LIST":
                setCampaigns(data.campaigns);
                break;
            case "CAMPAIGN_JOINED":
                setMyPlayer(data.player);
                setInventory(data.playerId, data.inventory);
                break;
            case "CAMPAIGN_JOINED_DM":
                setDmCampaign(data.campaign);
                data.campaign.players.forEach((p: any) => setInventory(p.id, p.inventory));
                break;
            case "PLAYER_LIST":
                setPlayerList(data.players);
                break;
            case "INVENTORY_SYNC":
                setInventory(data.playerId, data.inventory);
                break;
            case "CAPACITY_UPDATED":
                setCapacity(data.playerId, { used: data.used, max: data.max });
                break;
            case "ERROR":
                setError(data.message);
                break;
        }
    }, [lastJsonMessage]);

    return { readyState };
}