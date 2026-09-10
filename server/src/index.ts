import { connections } from "./campaigns";
import { addItem, createCampaign, createPlayer, deletePlayer, dropItem, getCampaigns, joinCampaign, moveItemIntoBag, moveItemOutOfBag, pickUpItem, removeItem, transferItem } from "./handlers";

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
                    createCampaign(data.name);
                    break;
                case "GET_CAMPAIGNS":
                    getCampaigns(ws);
                    break
                case "JOIN_CAMPAIGN":
                    joinCampaign(ws, data.campaignCode, data.playerName)
                    break;
                case "CREATE_PLAYER":
                    createPlayer(ws, data.player, data.campaignCode);
                    break;
                case "DELETE_PLAYER":
                    deletePlayer(ws, data.playerId, data.campaignCode);
                    break;
                case "ADD_ITEM":
                    addItem(ws, data.item, data.playerId, data.campaignCode);
                    break;
                case "REMOVE_ITEM":
                    removeItem(ws, data.itemId, data.playerId, data.campaignCode);
                    break;
                case "DROP_ITEM":
                    dropItem(ws, data.itemId, data.playerId, data.note, data.campaignCode);
                    break;
                case "PICK_UP_ITEM":
                    pickUpItem(ws, data.itemId, data.playerId, data.campaignCode);
                    break;
                case "MOVE_ITEM":
                    if(data.direction === "IN"){
                        moveItemIntoBag(ws, data.itemId, data.playerId, data.bagId, data.campaignCode);
                    }else{
                        moveItemOutOfBag(ws, data.itemId, data.playerId, data.bagId, data.campaignCode);
                    }
                    break;
                case "TRANSFER_ITEM":
                    transferItem(ws, data.itemId, data.giverPlayerId, data.getterPlayerId, data.campaignCode);
                    break;
            }
        },

        close(ws){
            console.log("Disconnected");
            connections.delete(ws);
        }
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`);