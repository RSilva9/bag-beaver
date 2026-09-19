package com.sarddo.bag_beaver.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @Enumerated(EnumType.STRING)
    @Column(name = "player_role", nullable = false)
    private PlayerRole playerRole;

    public Player() {}

    public UUID getId() { return id; }
    private void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    private void setName(String name) { this.name = name; }

    public Inventory getInventory() { return inventory; }
    private void setInventory(Inventory inventory) { this.inventory = inventory; }

    public PlayerRole getRole() { return playerRole; }
    private void setPlayerRole(PlayerRole playerRole) { this.playerRole = playerRole; }

}
