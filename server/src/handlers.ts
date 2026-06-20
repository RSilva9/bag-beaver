import { ServerWebSocket } from "bun";
import { sessions } from "./sessions";
import randomstring from "randomstring";
import { JoinData } from "./types";
import { createPlayer, findPlayerByName, saveSession } from "./utils";

export function createSession(ws: ServerWebSocket){
    let sessionCode;
    do{
        sessionCode = randomstring.generate({length: 5, charset: "alphanumeric"});
    }
    while(sessions.has(sessionCode));

    const session = {
        code: sessionCode,
        nextPlayerId: 1,
        dm: ws,
        players: new Map()
    }
    
    sessions.set(sessionCode, session)

    saveSession(session);
}

export function joinSession(ws: ServerWebSocket, data: JoinData){
    const session = sessions.get(data.sessionCode);

    if(!session){
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Session not found"
        }));
        return;
    }
    
    const player =
        findPlayerByName(session, data.playerName)
        ?? createPlayer(session, data.playerName);

    player.ws = ws;

    saveSession(session);

    ws.send(JSON.stringify({
        type: "SESSION_JOINED",
        player: player.player
    }))
}