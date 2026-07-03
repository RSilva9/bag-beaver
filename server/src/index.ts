import { closeCampaign, createCampaign, createPlayer, deletePlayer, hostCampaign, joinCampaign } from "./handlers";

const server = Bun.serve({
    port: 3000,

    fetch(req, server){
        if(server.upgrade(req)){
            return;
        }

        return new Response("Hello");
    },

    websocket: {
        open(ws){
            console.log("Connected");
        },

        message(ws, message){
            const data = JSON.parse(message.toString());
            
            switch(data.type){
                case "CREATE_CAMPAIGN":
                    createCampaign(ws);
                    break;
                case "HOST_CAMPAIGN":
                    hostCampaign(ws, data.campaignCode);
                    break;
                case "CLOSE_CAMPAIGN":
                    closeCampaign(ws);
                    break;
                case "JOIN_CAMPAIGN":
                    joinCampaign(ws, data.joinData)
                    break;
                case "CREATE_PLAYER":
                    createPlayer(ws, data.player);
                    break;
                case "DELETE_PLAYER":
                    deletePlayer(ws, data.playerId);
            }
        },

        close(ws){
            console.log("Disconnected");
        }
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`);