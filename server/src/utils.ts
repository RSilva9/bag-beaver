import { ConnectedPlayer, Session, SessionData } from "./types";
import fs from "fs";


export function findPlayerByName(session: Session, playerName: string): ConnectedPlayer|undefined {
    const foundPlayer = [...session.players.values()]
        .find(p => p.player.name === playerName);

    return foundPlayer;
}

export function createPlayer(session: Session, playerName: string): ConnectedPlayer {
    const id: number = session.nextPlayerId++;
    const connectedPlayer: ConnectedPlayer = {
        player: {
            id,
            name: playerName,
            inventory: {
                capacity: 100,
                items: []
            }
        }
    };

    session.players.set(id, connectedPlayer);
    
    return connectedPlayer;
}

export function saveSession(session: Session){
    fs.writeFile("./session.json", JSON.stringify({
        code: session.code,
        nextPlayerId: session.nextPlayerId,
        players: [...session.players.values()].map(p => p.player)
    }, null, 4), "utf-8", (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}