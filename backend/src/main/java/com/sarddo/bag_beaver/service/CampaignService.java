package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.Campaign;
import com.sarddo.bag_beaver.model.DroppedItem;
import com.sarddo.bag_beaver.model.Item;
import com.sarddo.bag_beaver.model.Player;
import com.sarddo.bag_beaver.repository.CampaignRepository;
import com.sarddo.bag_beaver.repository.ItemRepository;
import com.sarddo.bag_beaver.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final PlayerRepository playerRepository;
    private final ItemRepository itemRepository;

    public CampaignService(CampaignRepository campaignRepository, PlayerRepository playerRepository, ItemRepository itemRepository){
        this.campaignRepository = campaignRepository;
        this.playerRepository = playerRepository;
        this.itemRepository = itemRepository;
    }

    public void createCampaign(String code, String name, String dmSecret) {
        campaignRepository.save(
                new Campaign(code, name, dmSecret)
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
    public void dropItem(String campaignCode, Long playerId, Long itemId, String note) {
        Campaign campaign = campaignRepository.findById(campaignCode)
                .orElseThrow(() -> new EntityNotFoundException("Campaign not found"));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        List<DroppedItem> droppedItems = campaign.getDroppedItems();
        droppedItems.add(new DroppedItem(campaign, item, note));
        player.getInventory().removeItem(item);
    }
}
