package com.sarddo.bag_beaver.model;


import jakarta.persistence.*;

@Entity
@Table(name = "dropped_items")
public class DroppedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "campaign_code")
    private Campaign campaign;

    @OneToOne(optional = false)
    @JoinColumn(name = "item_id", unique = true)
    private Item item;

    private String note;

    protected DroppedItem() {}

    public DroppedItem(Campaign campaign, Item item, String note) {
        this.campaign = campaign;
        this.item = item;
        this.note = note;
    }

    public Long getId() { return id; }
    public Campaign getCampaign() { return campaign; }
    public Item getItem() { return item; }
    public String getNote() { return note; }

    private void setNote(String note) { this.note = note; }
}
