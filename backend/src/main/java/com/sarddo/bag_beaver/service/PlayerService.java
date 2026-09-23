package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.*;
import com.sarddo.bag_beaver.repository.ItemRepository;
import com.sarddo.bag_beaver.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final ItemRepository itemRepository;
    private final CampaignService campaignService;
    private final InventoryService inventoryService;

    public PlayerService(PlayerRepository playerRepository, ItemRepository itemRepository,
                         CampaignService campaignService, InventoryService inventoryService) {
        this.playerRepository = playerRepository;
        this.itemRepository = itemRepository;
        this.campaignService = campaignService;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public void createPlayer(String name, Inventory inventory, PlayerRole playerRole, Campaign campaign) {
        Player player = new Player(name, inventory, playerRole);
        playerRepository.save(player);
        campaignService.addPlayerToCampaign(campaign.getCode() , player);
    }

    @Transactional
    public void transferItem(Long giverId, Long getterId, Long itemId) {
        Player giver = playerRepository.findById(giverId)
                .orElseThrow(() -> new EntityNotFoundException("Giver player not found"));
        Player getter = playerRepository.findById(getterId)
                .orElseThrow(() -> new EntityNotFoundException("Getter player not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        inventoryService.moveItem(item, giver.getInventory(), getter.getInventory());
    }

    @Transactional
    public void moveInOrOutOfBag(Long itemId, Long bagId, Boolean into, Long playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        Item bag = itemRepository.findById(bagId)
                .orElseThrow(() -> new EntityNotFoundException("Bag not found"));

        if(into){
            inventoryService.moveItem(item, player.getInventory(), bag.getBag());
        } else {
            inventoryService.moveItem(item, bag.getBag(), player.getInventory());
        }
    }
}
