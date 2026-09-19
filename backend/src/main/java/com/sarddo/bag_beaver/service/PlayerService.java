package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.Campaign;
import com.sarddo.bag_beaver.model.Inventory;
import com.sarddo.bag_beaver.model.Player;
import com.sarddo.bag_beaver.model.PlayerRole;
import com.sarddo.bag_beaver.repository.PlayerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final CampaignService campaignService;

    public PlayerService(PlayerRepository playerRepository, CampaignService campaignService) {
        this.playerRepository = playerRepository;
        this.campaignService = campaignService;
    }

    @Transactional
    public void createPlayer(String name, Inventory inventory, PlayerRole playerRole, Campaign campaign) {
        Player player = new Player(name, inventory, playerRole);
        playerRepository.save(player);
        campaignService.addPlayerToCampaign(campaign.getCode() , player);
    }
}
