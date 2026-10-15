package com.sarddo.bag_beaver.websocket;

import com.sarddo.bag_beaver.model.*;
import com.sarddo.bag_beaver.service.CampaignService;
import com.sarddo.bag_beaver.service.InventoryService;
import com.sarddo.bag_beaver.service.ItemService;
import com.sarddo.bag_beaver.service.PlayerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CampaignWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<WebSocketSession, Connection> connections = new ConcurrentHashMap<>();
    private final CampaignService campaignService;
    private final PlayerService playerService;
    private final ItemService itemService;
    private final InventoryService inventoryService;
    private final CampaignBroadcaster broadcaster;

    public CampaignWebSocketHandler(CampaignService campaignService,
                                    PlayerService playerService,
                                    ItemService itemService,
                                    InventoryService inventoryService,
                                    CampaignBroadcaster broadcaster) {

        this.campaignService = campaignService;
        this.playerService = playerService;
        this.itemService = itemService;
        this.inventoryService = inventoryService;
        this.broadcaster = broadcaster;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("Connection established! Session:" + session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            String type = root.get("type").asString();

            switch(type) {
                case "CREATE_CAMPAIGN" -> {
                    String name = root.get("campaignName").asString();
                    String dmSecret = root.get("dmSecret").asString();

                    handleCreateCampaign(session, name, dmSecret);
                }
                case "GET_CAMPAIGNS" -> handleGetCampaigns(session);
                case "JOIN_CAMPAIGN" -> {
                    String playerName = root.get("playerName").asString();
                    String campaignCode = root.get("campaignCode").asString();

                    handleJoinCampaign(session, campaignCode, playerName);
                }
                case "JOIN_CAMPAIGN_AS_DM" -> {
                    String dmSecret = root.get("dmSecret").asString();
                    String campaignCode = root.get("campaignCode").asString();

                    handleJoinCampaignAsDM(session, campaignCode, dmSecret);
                }
                case "ADD_PLAYER_TO_CAMPAIGN" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long playerId = root.get("playerId").asLong();

                    handleAddPlayerToCampaign(campaignCode, playerId);
                }
                case "REMOVE_PLAYER_FROM_CAMPAIGN" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long playerId = root.get("playerId").asLong();

                    handleRemovePlayerFromCampaign(campaignCode, playerId);
                }
                case "DELETE_PLAYER" -> {
                    Long playerId = root.get("playerId").asLong();

                    handleDeletePlayer(session, playerId);
                }
                case "GRANT_ITEM_TO_PLAYER" -> requireRole(session, PlayerRole.DM, () -> {
                    String campaignCode = root.get("campaignCode").asString();
                    String itemName = root.get("itemName").asString();
                    String itemDescription = root.get("itemDescription").asString();
                    Double itemSize = root.get("itemSize").asDouble();
                    Long playerId = root.get("playerId").asLong();

                    handleGrantItemToPlayer(campaignCode, playerId, itemName, itemDescription, itemSize);
                });
                case "DROP_ITEM" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long playerId = root.get("playerId").asLong();
                    Long itemId = root.get("itemId").asLong();
                    String note = root.get("note").asString();

                    handleDropItem(campaignCode, playerId, itemId, note);
                }
                case "PICK_UP_ITEM" -> requireRole(session, PlayerRole.DM, () -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long playerId = root.get("playerId").asLong();
                    Long itemId = root.get("itemId").asLong();

                    handlePickUpItem(campaignCode, playerId, itemId);
                });
                case "CREATE_PLAYER" -> requireRole(session, PlayerRole.DM, () -> {
                    String campaignCode = root.get("campaignCode").asString();
                    String playerName = root.get("playerName").asString();
                    Double inventoryCapacity = root.get("inventoryCapacity").asDouble();

                    handleCreatePlayer(campaignCode, playerName, inventoryCapacity);
                });
                case "TRANSFER_ITEM" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long giverId = root.get("giverId").asLong();
                    Long getterId = root.get("getterId").asLong();
                    Long itemId = root.get("itemId").asLong();

                    handleTransferItem(campaignCode, giverId, getterId, itemId);
                }
                case "MOVE_IN_OR_OUT_OF_BAG" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long playerId = root.get("playerId").asLong();
                    Long itemId = root.get("itemId").asLong();
                    Long bagId = root.get("bagId").asLong();
                    Boolean into = root.get("into").asBoolean();

                    handleMoveInOrOutOfBag(campaignCode, itemId, bagId, into, playerId);
                }
                case "CREATE_ITEM" -> requireRole(session, PlayerRole.DM, () -> {
                    String campaignCode = root.get("campaignCode").asString();
                    String itemName = root.get("itemName").asString();
                    String itemDescription = root.get("itemDescription").asString();
                    Double itemSize = root.get("itemSize").asDouble();

                    handleCreateItem(campaignCode, itemName, itemDescription, itemSize);
                });
                case "DELETE_ITEM" -> requireRole(session, PlayerRole.DM, () -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long itemId = root.get("itemId").asLong();

                    handleDeleteItem(campaignCode, itemId);
                });
                case "CHANGE_ITEM_SIZE" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long itemId = root.get("itemId").asLong();
                    Double itemSize = root.get("itemSize").asDouble();

                    handleChangeItemSize(campaignCode, itemId, itemSize);
                }
                case "CHANGE_ITEM_NAME" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long itemId = root.get("itemId").asLong();
                    String itemName = root.get("itemName").asString();

                    handleChangeItemName(campaignCode, itemId, itemName);
                }
                case "CHANGE_ITEM_DESCRIPTION" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long itemId = root.get("itemId").asLong();
                    String itemDescription = root.get("itemDescription").asString();

                    handleChangeItemDescription(campaignCode, itemId, itemDescription);
                }
                case "DISCARD_ITEM" -> {
                    String campaignCode = root.get("campaignCode").asString();
                    Long itemId = root.get("itemId").asLong();
                    Long inventoryId = root.get("inventoryId").asLong();

                    handleDiscardItem(campaignCode, itemId, inventoryId);
                }
                default -> broadcaster.sendError(session, "Unknown message type: " + type);
            }
        } catch (EntityNotFoundException | IllegalStateException e) {
            broadcaster.sendError(session, e.getMessage());
        } catch (Exception e) {
            broadcaster.sendError(session, "Unexpected error.");
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

    private void handleAddPlayerToCampaign(String campaignCode, Long playerId) {
        campaignService.addPlayerToCampaign(campaignCode, playerId);
        Map<String, Object> message = Map.of(
                "type", "PLAYER_ADDED",
                "playerId", playerId
        );
        Optional<WebSocketSession> dmSession = broadcaster.findDmSession(campaignCode);
        dmSession.ifPresent(webSocketSession -> broadcaster.sendJson(webSocketSession, message));
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

    private void handleDeletePlayer(WebSocketSession session, Long playerId) {
        campaignService.deletePlayer(playerId);
        Map<String, Object> message = Map.of(
                "type", "PLAYER_DELETED",
                "playerId", playerId
        );
        broadcaster.sendJson(session, message);
    }

    private void handleGrantItemToPlayer(String campaignCode, Long playerId, String itemName,
                                         String itemDescription, Double itemSize) {
        campaignService.grantItemToPlayer(itemName, itemDescription, itemSize, playerId);

        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
    }

    private void handleDropItem(String campaignCode, Long playerId, Long itemId, String note) {
        campaignService.dropItem(campaignCode, playerId, itemId, note);
        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
        broadcaster.notifyDroppedItemsChange(campaignCode, this.campaignService);
    }

    private void handlePickUpItem(String campaignCode, Long playerId, Long itemId) {
        campaignService.pickUpItem(campaignCode, playerId, itemId);
        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
        broadcaster.notifyDroppedItemsChange(campaignCode, this.campaignService);
    }

    // Player Handlers
    private void handleCreatePlayer(String campaignCode, String playerName, Double inventoryCapacity) {
        Player player = playerService.createPlayer(playerName, "main", inventoryCapacity, campaignCode);
        Map<String, Object> message = Map.of(
                "type", "PLAYER_CREATED",
                "playerId", player.getId()
        );
        Optional<WebSocketSession> dmSession = broadcaster.findDmSession(campaignCode);
        dmSession.ifPresent(webSocketSession -> broadcaster.sendJson(webSocketSession, message));
    }

    private void handleTransferItem(String campaignCode, Long giverId, Long getterId, Long itemId) {
        playerService.transferItem(giverId, getterId, itemId);
        broadcaster.notifyInventoryChange(campaignCode, giverId, this.playerService);
        broadcaster.notifyInventoryChange(campaignCode, getterId, this.playerService);
    }

    private void handleMoveInOrOutOfBag(String campaignCode, Long itemId, Long bagId, Boolean into, Long playerId) {
        playerService.moveInOrOutOfBag(itemId, bagId, into, playerId);
        broadcaster.notifyInventoryChange(campaignCode, playerId, this.playerService);
    }

    // Item Handlers
    private void handleCreateItem(String campaignCode, String name, String description, Double size) {
        Item item = itemService.createItem(name, description, size);
        Map<String, Object> message = Map.of(
                "type", "ITEM_CREATED",
                "playerId", item.getId()
        );
        Optional<WebSocketSession> dmSession = broadcaster.findDmSession(campaignCode);
        dmSession.ifPresent(webSocketSession -> broadcaster.sendJson(webSocketSession, message));
    }

    private void handleDeleteItem(String campaignCode, Long itemId) {
        itemService.deleteItem(itemId);
        Map<String, Object> message = Map.of(
                "type", "ITEM_DELETED",
                "playerId", itemId
        );
        Optional<WebSocketSession> dmSession = broadcaster.findDmSession(campaignCode);
        dmSession.ifPresent(webSocketSession -> broadcaster.sendJson(webSocketSession, message));
    }

    private void handleChangeItemSize(String campaignCode, Long itemId, Double size) {
        itemService.changeItemSize(itemId, size);
        Long itemOwnerId = campaignService.getItemOwner(itemId).getId();
        broadcaster.notifyInventoryChange(campaignCode, itemOwnerId, this.playerService);
    }

    private void handleChangeItemName(String campaignCode, Long itemId, String name) {
        itemService.changeItemName(itemId, name);
        Long itemOwnerId = campaignService.getItemOwner(itemId).getId();
        broadcaster.notifyInventoryChange(campaignCode, itemOwnerId, this.playerService);
    }

    private void handleChangeItemDescription(String campaignCode, Long itemId, String description) {
        itemService.changeItemDescription(itemId, description);
        Long itemOwnerId = campaignService.getItemOwner(itemId).getId();
        broadcaster.notifyInventoryChange(campaignCode, itemOwnerId, this.playerService);
    }

    // Inventory Handlers
    private void handleDiscardItem(String campaignCode, Long itemId, Long inventoryId) {
        inventoryService.discardItem(itemId, inventoryId);
        Long itemOwnerId = campaignService.getItemOwner(itemId).getId();
        broadcaster.notifyInventoryChange(campaignCode, itemOwnerId, this.playerService);
    }
}
