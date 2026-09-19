package com.sarddo.bag_beaver.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campaigns")
public class Campaign {
    @Id
    private String code;

    private String name;

    private String dmSecret;

    @OneToMany(mappedBy = "campaign", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DroppedItem> droppedItems = new ArrayList<>();

    protected Campaign() {}

    public Campaign(String code, String name, String dmSecret) {
        this.code = code;
        this.name = name;
        this.dmSecret = dmSecret;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDmSecret() { return dmSecret; }
    public List<Player> getPlayers() { return players; }
    public List<DroppedItem> getDroppedItems() { return droppedItems; }

    public void setName(String name) { this.name = name; }
    public void addPlayer(Player player) {
        players.add(player);
        player.setCampaign(this);
    }
    public void removePlayer(Player player) {
        players.remove(player);
        player.setCampaign(null);
    }
}
