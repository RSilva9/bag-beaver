import useWebSocket, { ReadyState } from "react-use-websocket";
import { useEffect } from "react";
import { useAppStore } from "./store";

export function useSocketConnection(){
    const setSendMessage = useAppStore(s => s.setSendMessage);
    const setCampaigns = useAppStore(s => s.setCampaigns);
    const setInventory = useAppStore(s => s.setInventory);
    const setError = useAppStore(s => s.setError);

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
                
        }
    }, [lastJsonMessage]);

    return { readyState };
}