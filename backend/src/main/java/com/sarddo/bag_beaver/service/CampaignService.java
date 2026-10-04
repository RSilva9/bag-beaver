package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.*;
import com.sarddo.bag_beaver.repository.CampaignRepository;
import com.sarddo.bag_beaver.repository.DroppedItemRepository;
import com.sarddo.bag_beaver.repository.ItemRepository;
import com.sarddo.bag_beaver.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final PlayerRepository playerRepository;
    private final ItemRepository itemRepository;
    private final DroppedItemRepository droppedItemRepository;
    private final ItemService itemService;
    private final InventoryService inventoryService;

    public CampaignService(CampaignRepository campaignRepository, PlayerRepository playerRepository,
                           ItemRepository itemRepository, DroppedItemRepository droppedItemRepository, ItemService itemService, InventoryService inventoryService){
        this.campaignRepository = campaignRepository;
        this.playerRepository = playerRepository;
        this.itemRepository = itemRepository;
        this.droppedItemRepository = droppedItemRepository;
        this.itemService = itemService;
        this.inventoryService = inventoryService;
    }

    public void createCampaign(String name, String dmSecret) {
        String newCode = "";
        do {
            newCode = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
        while(campaignRepository.existsById(newCode));

        campaignRepository.save(
                new Campaign(newCode, name, dmSecret)
        );
    }

    @Transactional
    public void addPlayerToCampaign(String campaignCode, Player player) {
        Campaign campaign = campaignRepository.findById(campaignCode)
                .orElseThrow(() -> new EntityNotFoundException("Campaign not found"));
        campaign.addPlayer(player);
        player.setCampaign(campaign);
    }

    @Transactional
    public void removePlayerFromCampaign(String campaignCode, Player player) {
        Campaign campaign = campaignRepository.findById(campaignCode)
                .orElseThrow(() -> new EntityNotFoundException("Campaign not found"));
        campaign.removePlayer(player);
        player.setCampaign(null);
    }

    @Transactional
    public void deletePlayer(Long playerId){
        playerRepository.deleteById(playerId);
    }

    @Transactional
    public void grantItemToPlayer(String itemName, String itemDescription, Double itemSize, Long playerId){
        Item item = itemService.createItem(itemName, itemDescription, itemSize);
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        inventoryService.addItemToInventory(item.getId(), player.getInventory().getId());
    }

    @Transactional
    public void dropItem(String campaignCode, Long playerId, Long itemId, String note) {
        Campaign campaign = campaignRepository.findById(campaignCode)
                .orElseThrow(() -> new EntityNotFoundException("Campaign not found"));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        droppedItemRepository.save(new DroppedItem(campaign, item, note));
        player.getInventory().removeItem(item);
    }

    @Transactional
    public void pickUpItem(String campaignCode, Long playerId, Long itemId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        DroppedItem droppedItem = droppedItemRepository.findByCampaign_CodeAndItem_Id(campaignCode, itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        player.getInventory().addItem(droppedItem.getItem());
        droppedItemRepository.delete(droppedItem);
    }
}
