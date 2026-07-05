import { addItem, closeCampaign, createCampaign, createPlayer, deletePlayer, dropItem, hostCampaign, joinCampaign, moveItemIntoBag, moveItemOutOfBag, removeItem, transferItem } from "./handlers";

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
                    joinCampaign(ws, data.campaignCode, data.playerName)
                    break;
                case "CREATE_PLAYER":
                    createPlayer(ws, data.player);
                    break;
                case "DELETE_PLAYER":
                    deletePlayer(ws, data.playerId);
                    break;
                case "ADD_ITEM":
                    addItem(ws, data.item, data.playerId);
                    break;
                case "REMOVE_ITEM":
                    removeItem(ws, data.itemId, data.playerId);
                    break;
                case "DROP_ITEM":
                    dropItem(ws, data.itemId, data.playerId, data.note);
                    break;
                case "MOVE_ITEM":
                    if(data.direction === "IN"){
                        moveItemIntoBag(ws, data.itemId, data.playerId, data.bagId);
                    }else{
                        moveItemOutOfBag(ws, data.itemId, data.playerId, data.bagId);
                    }
                    break;
                case "TRANSFER_ITEM":
                    transferItem(ws, data.itemId, data.giverPlayerId, data.getterPlayerId);
                    break;
            }
        },

        close(ws){
            console.log("Disconnected");
        }
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`);