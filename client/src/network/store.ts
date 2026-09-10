import { create } from "zustand";
import type { Campaign, Inventory, Item, Player } from "../../../shared/src/types";

type SendFn = (msg: object) => void;

interface AppState {
    campaigns: Campaign[];
    dmCampaign: Campaign | null;
    myPlayer: Player | null;
    capacities: Record<number, { used: number; max: number; }>;
    otherPlayers: { id: number; name: string; }[];
    inventories: Record<number, Inventory>;
    error: string | null;

    sendMessage: SendFn;
    setSendMessage: (fn: SendFn) => void;

    setCampaigns: (campaigns: Campaign[]) => void;
    setDmCampaign: (campaign: Campaign) => void;
    setMyPlayer: (player: Player) => void;
    setCapacity: (playerId: number, load: { used: number; max: number; }) => void;
    setPlayerList: (players: { id: number; name: string; used: number; max: number; }[]) => void;
    setInventory: (playerId: number, inventory: Inventory) => void;
    setError: (msg: string) => void;

    createCampaign: (name: string) => void;
    getCampaigns: () => void;
    joinCampaign: (campaignCode: string, playerName: string) => void;
    joinCampaignAsDM: (campaignCode: string, dmSecret: string) => void;
    createPlayer: (playerData: Player, campaignCode: string) => void;
    deletePlayer: (playerId: number, campaignCode: string) => void;
    addItem: (item: Item, playerId: number, campaignCode: string) => void;
    removeItem: (itemId: string, playerId: number, campaignCode: string) => void;
    dropItem: (itemId: string, playerId: number, note: string, campaignCode: string) => void;
    pickUpItem: (itemId: string, playerId: number, campaignCode: string) => void;
    moveItemIntoBag: (itemId: string, playerId: number, bagId: string, campaignCode: string) => void;
    moveItemOutOfBag: (itemId: string, playerId: number, bagId: string, campaignCode: string) => void;
    transferItem: (itemId: string, giverPlayerId: number, getterPlayerId: number, campaignCode: string) => void;
    changeItemSize: (playerId: number, itemId: string, newSize: number, campaignCode: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    campaigns: [],
    dmCampaign: null,
    myPlayer: null,
    capacities: {},
    otherPlayers: [],
    inventories: {},
    error: null,

    sendMessage: () => console.warn("Socket not ready yet."),
    setSendMessage: (fn) => set({ sendMessage: fn }),

    setCampaigns: (campaigns) => set({ campaigns }),
    setDmCampaign: (campaign) => set({ dmCampaign: campaign }),
    setMyPlayer: (player) => set({ myPlayer: player }),
    setCapacity: (playerId, load) => 
        set((state) => ({ capacities: { ...state.capacities, [playerId]: load } })),
    setPlayerList: (players) =>
        set((state) => ({
            otherPlayers: players.map(p => ({ id: p.id, name: p.name })),
            capacities: {
                ...state.capacities,
                ...Object.fromEntries(players.map(p => [p.id, { used: p.used, max: p.max }]))
            }
        })),
    setInventory: (playerId, inventory) =>
        set((state) => ({ inventories: { ...state.inventories, [playerId]: inventory } })),
    setError: (message) => set({ error: message }),

    createCampaign: (name) => get().sendMessage({ 
        type: "CREATE_CAMPAIGN",
        name
    }),
    getCampaigns: () => get().sendMessage({ type: "GET_CAMPAIGNS" }),
    joinCampaign: (campaignCode, playerName) => get().sendMessage({ 
        type: "JOIN_CAMPAIGN", 
        campaignCode, 
        playerName
    }),
    joinCampaignAsDM: (campaignCode, dmSecret) => get().sendMessage({ 
        type: "JOIN_CAMPAIGN_AS_DM", 
        campaignCode, 
        dmSecret
    }),
    createPlayer: (playerData, campaignCode) => get().sendMessage({
        type: "CREATE_PLAYER",
        playerData,
        campaignCode
    }),
    deletePlayer: (playerId, campaignCode) => get().sendMessage({
        type: "DELETE_PLAYER",
        playerId,
        campaignCode
    }),
    addItem: (item, playerId, campaignCode) => get().sendMessage({
        type: "ADD_ITEM",
        item,
        playerId,
        campaignCode
    }),
    removeItem: (itemId, playerId, campaignCode) => get().sendMessage({
        type: "REMOVE_ITEM",
        itemId,
        playerId,
        campaignCode
    }),
    dropItem: (itemId, playerId, note, campaignCode) => get().sendMessage({
        type: "DROP_ITEM",
        itemId,
        playerId,
        note,
        campaignCode
    }),
    pickUpItem: (itemId, playerId, campaignCode) => get().sendMessage({
        type: "PICK_UP_ITEM",
        itemId,
        playerId,
        campaignCode
    }),
    moveItemIntoBag: (itemId, playerId, bagId, campaignCode) => get().sendMessage({
        type: "MOVE_ITEM",
        itemId,
        playerId,
        bagId,
        direction: "IN",
        campaignCode
    }),
    moveItemOutOfBag: (itemId, playerId, bagId, campaignCode) => get().sendMessage({
        type: "MOVE_ITEM",
        itemId,
        playerId,
        bagId,
        direction: "OUT",
        campaignCode
    }),
    transferItem: (itemId, giverPlayerId, getterPlayerId, campaignCode) => get().sendMessage({
        type: "TRANSFER_ITEM",
        itemId,
        giverPlayerId,
        getterPlayerId,
        campaignCode
    }),
    changeItemSize: (playerId, itemId, newSize, campaignCode) => get().sendMessage({
        type: "CHANGE_ITEM_SIZE",
        playerId,
        itemId,
        newSize,
        campaignCode
    })
}))