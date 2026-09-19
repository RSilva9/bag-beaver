package com.sarddo.bag_beaver.model;

import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @Enumerated(EnumType.STRING)
    @Column(name = "player_role", nullable = false)
    private PlayerRole playerRole;

    @ManyToOne(optional = true)
    @JoinColumn(name = "campaign_code")
    private Campaign campaign;

    protected Player() {}

    public Player(String name, Inventory inventory, PlayerRole playerRole) {
        this.name = name;
        this.inventory = inventory;
        this.playerRole = playerRole;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Inventory getInventory() { return inventory; }
    public PlayerRole getPlayerRole() { return playerRole; }
    public Campaign getCampaign() { return campaign; }

    public void setPlayerRole(PlayerRole playerRole) { this.playerRole = playerRole; }
    public void setName(String name) { this.name = name; }
    public void setCampaign(Campaign campaign) { this.campaign = campaign; }
}
