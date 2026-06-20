import { createSession } from "./handlers";

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
                case "CREATE_SESSION":
                    createSession(ws);
                    break;
                case "JOIN_SESSION":
                    // joinSession(ws, data)
                    break;
            }
        },

        close(ws){
            console.log("Disconnected");
        }
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`);