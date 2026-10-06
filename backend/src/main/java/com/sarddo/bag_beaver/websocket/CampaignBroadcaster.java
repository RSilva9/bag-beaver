package com.sarddo.bag_beaver.websocket;

import com.sarddo.bag_beaver.model.DroppedItem;
import com.sarddo.bag_beaver.model.Player;
import com.sarddo.bag_beaver.model.PlayerRole;
import com.sarddo.bag_beaver.service.CampaignService;
import com.sarddo.bag_beaver.service.PlayerService;
import com.sarddo.bag_beaver.service.PlayerSummary;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CampaignBroadcaster {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<WebSocketSession, Connection> connections = new ConcurrentHashMap<>();

    public Map<WebSocketSession, Connection> getConnections() {
        return connections;
    }

    public void sendError(WebSocketSession session, String errorMessage) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "type", "ERROR",
                    "message", errorMessage
            ));
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }

    public void sendJson(WebSocketSession session, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            System.out.println("ERROR sending JSON: " + e.getMessage());
        }
    }

    public void sendToPlayer(String campaignCode, Long playerId, Object payload) {
        findSessionByPlayerId(campaignCode, playerId)
                .ifPresent(session -> {
                    try {
                        String json = objectMapper.writeValueAsString(payload);
                        session.sendMessage(new TextMessage(json));
                    } catch (IOException e) {
                        System.out.println("ERROR: " + e.getMessage());
                    }
                });
    }

    public Optional<WebSocketSession> findSessionByPlayerId(String campaignCode, Long playerId) {
        return connections.entrySet().stream()
                .filter(entry -> entry.getValue().campaignCode().equals(campaignCode)
                        && entry.getValue().playerId().equals(playerId))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    public Optional<WebSocketSession> findDmSession(String campaignCode) {
        return connections.entrySet().stream()
                .filter(entry -> entry.getValue().campaignCode().equals(campaignCode)
                        && entry.getValue().role().equals(PlayerRole.DM))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    //Broadcasters
    public void broadcastToCampaign(String campaignCode, Object payload) {
        connections.forEach((session, conn) -> {
            if(conn.campaignCode().equals(campaignCode) && session.isOpen()) {
                sendJson(session, payload);
            }
        });
    }

    // Handlers
    public void broadcastPlayerList(String campaignCode, CampaignService campaignService) {
        List<PlayerSummary> partyStatus = campaignService.getPartyStatus(campaignCode);
        Map<String, Object> message = Map.of(
                "type", "PLAYER_LIST",
                "players", partyStatus
        );

        broadcastToCampaign(campaignCode, message);
    }

    public void broadcastCapacity(String campaignCode, Long playerId, Double used, Double max) {
        Map<String, Object> message = Map.of(
                "type", "CAPACITY_UPDATED",
                "playerId", playerId,
                "used", used,
                "max", max
        );
        broadcastToCampaign(campaignCode, message);
    }

    public void notifyInventoryChange(String campaignCode, Long playerId, PlayerService playerService) {
        Player updatedPlayer = playerService.getPlayer(campaignCode, playerId);
        Map<String, Object> playerPayload = Map.of(
                "type", "INVENTORY_UPDATED",
                "inventory", updatedPlayer.getInventory()
        );

        Map<String, Object> DMPayload = Map.of(
                "type", "PLAYER_INVENTORY_UPDATED",
                "player", updatedPlayer
        );

        this.broadcastCapacity(campaignCode, playerId,
                updatedPlayer.getInventory().getUsedSize(),
                updatedPlayer.getInventory().getCapacity()
        );

        connections.forEach((session, conn) -> {
            if(conn.campaignCode().equals(campaignCode) && session.isOpen()) {
                if(conn.role().equals(PlayerRole.DM)) {
                    sendJson(session, DMPayload);
                } else if(conn.playerId().equals(playerId)) {
                    sendJson(session, playerPayload);
                }
            }
        });
    }

    public void notifyDroppedItemsChange(String campaignCode, CampaignService campaignService) {
        List<DroppedItem> droppedItems = campaignService.getDroppedItems(campaignCode);
        Map<String, Object> playerPayload = Map.of(
                "type", "DROPPED_ITEMS_UPDATED",
                "droppedItems", droppedItems
        );
    }

}
