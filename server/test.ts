let socket: WebSocket;

function connect(){
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => console.log("Conectado");
    socket.onmessage = (e) => console.log(e.data);
};

function createCampaign(){
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "CREATE_CAMPAIGN"
        }))
    }
};

function joinCampaign(campaignCode: string, playerName: string){
    const joinData = {
        campaignCode,
        playerName
    }

    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "JOIN_CAMPAIGN",
            joinData
        }))
    }
};

function hostCampaign(campaignCode: string){
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "HOST_CAMPAIGN",
            campaignCode
        }))
    }
}

function closeCampaign(campaignCode: string){
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "CLOSE_CAMPAIGN",
            campaignCode
        }))
    }
}

connect();
// createCampaign();
// hostCampaign("UBDvZ");
joinCampaign("UBDvZ", "Smeagol");
