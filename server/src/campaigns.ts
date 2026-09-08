import { ServerWebSocket } from "bun";
import { loadCampaigns } from "./utils";
import { Connection } from "./types";

export const campaigns = loadCampaigns();
export const connections: Map<ServerWebSocket,Connection> = new Map<ServerWebSocket, Connection>();