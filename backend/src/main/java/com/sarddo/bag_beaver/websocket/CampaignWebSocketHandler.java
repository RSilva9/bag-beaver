package com.sarddo.bag_beaver.websocket;

import com.sarddo.bag_beaver.model.Campaign;
import com.sarddo.bag_beaver.model.Inventory;
import com.sarddo.bag_beaver.model.Player;
import com.sarddo.bag_beaver.model.PlayerRole;
import com.sarddo.bag_beaver.service.CampaignService;
import com.sarddo.bag_beaver.service.PlayerService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CampaignWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<WebSocketSession, Connection> connections = new ConcurrentHashMap<>();
    private final CampaignService campaignService;
    private final PlayerService playerService;
    private final CampaignBroadcaster broadcaster;

    public CampaignWebSocketHandler(CampaignService campaignService, PlayerService playerService, CampaignBroadcaster broadcaster) {
        this.campaignService = campaignService;
        this.playerService = playerService;
        this.broadcaster = broadcaster;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("Connection established! Session:" + session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode root = objectMapper.readTree(message.getPayload());
        String type = root.get("type").asString();

        switch(type) {
            case "JOIN_CAMPAIGN" -> {
                String campaignCode = root.get("campaignCode").asString();
                String playerName = root.get("playerName").asString();
                handleJoinCampaign(session, campaignCode, playerName);
            }
            case "GET_CAMPAIGNS" -> handleGetCampaigns(session);
            case "CREATE_CAMPAIGN" -> {
                String name = root.get("campaignName").asString();
                String dmSecret = root.get("dmSecret").asString();

                handleCreateCampaign(session, name, dmSecret);
            }
            default -> broadcaster.sendError(session, "Unknown message type: " + type);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("Connection closed! Session:" + session);
        connections.remove(session);
    }

    private void requireRole(WebSocketSession session, PlayerRole requiredRole, Runnable action) {
        Connection conn = connections.get(session);

        if(conn == null) {
            broadcaster.sendError(session, "You haven't joined any campaign.");
            return;
        }

        if(!conn.role().equals(requiredRole)) {
            broadcaster.sendError(session, "ACCESS DENIED: You need " + requiredRole + " privileges");
            return;
        }

        action.run();
    }

    // Campaign Handlers
    private void handleCreateCampaign(WebSocketSession session, String name, String dmSecret) {
        campaignService.createCampaign(name, dmSecret);
        this.handleGetCampaigns(session);
    }

    private void handleGetCampaigns(WebSocketSession session) {
        Map<String, Object> message = Map.of(
                "type", "CAMPAIGN_LIST",
                "campaigns", campaignService.getCampaigns()
        );
        broadcaster.sendJson(session, message);
    }

    private void handleJoinCampaign(WebSocketSession session, String campaignCode, String playerName) {
        Player player = playerService.getPlayerByName(campaignCode, playerName);
        Map<String, Object> message = Map.of(
                "type", "CAMPAIGN_JOINED",
                "player", player
        );
        connections.put(session, new Connection(campaignCode, player.getId(), PlayerRole.PLAYER));
        broadcaster.sendJson(session, message);
        broadcaster.broadcastPlayerList(campaignCode, this.campaignService);
    }

    private void handleJoinCampaignAsDM(WebSocketSession session, String campaignCode, String dmSecret) {
        Boolean isValid = campaignService.validateDmSecret(campaignCode, dmSecret);
        if(!isValid) {
            broadcaster.sendError(session, "ACCESS DENIED: Incorrect DM secret");
            return;
        }
        Campaign campaign = campaignService.getCampaignByCode(campaignCode);

        Map<String, Object> message = Map.of(
                "type", "CAMPAIGN_JOINED_AS_DM",
                "player", campaign
        );
        connections.put(session, new Connection(campaignCode, null, PlayerRole.DM));
        broadcaster.sendJson(session, message);
    }

    private void handleAddPlayerToCampaign(String campaignCode, Player player) {
        campaignService.addPlayerToCampaign(campaignCode, player);
    }

    private void handleRemovePlayerFromCampaign(String campaignCode, Long playerId) {
        campaignService.removePlayerFromCampaign(campaignCode, playerId);

        broadcaster.findSessionByPlayerId(campaignCode, playerId).ifPresent(playerSession -> {
            broadcaster.sendJson(playerSession, Map.of(
                    "type", "KICKED_FROM_CAMPAIGN",
                    "message", "You have been removed from the campaign by the DM."
            ));
            connections.remove(playerSession);
            broadcaster.broadcastPlayerList(campaignCode, this.campaignService);
        });
    }

    private void handleDeletePlayer(Long playerId) {
        campaignService.deletePlayer(playerId);
    }

    private void handleGrantItemToPlayer(String itemName, String itemDescription, Double itemSize,
                                         Long playerId, String campaignCode) {
        campaignService.grantItemToPlayer(itemName, itemDescription, itemSize, playerId);

        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
    }

    private void handleDropItem(String campaignCode, Long playerId, Long itemId, String note) {
        campaignService.dropItem(campaignCode, playerId, itemId, note);
        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
        broadcaster.notifyDroppedItemsChange(campaignCode, this.campaignService);
    }

    private void handlePickUpItem(String campaignCode, Long playerId, Long itemId, String note) {
        campaignService.pickUpItem(campaignCode, playerId, itemId);
        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
        broadcaster.notifyDroppedItemsChange(campaignCode, this.campaignService);
    }

    // Player Handlers
    private void handleCreatePlayer(String campaignCode, String playerName, Inventory inventory) {

    }
}
