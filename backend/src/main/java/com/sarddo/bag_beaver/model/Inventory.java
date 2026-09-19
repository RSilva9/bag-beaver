package com.sarddo.bag_beaver.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inventories")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany
    @JoinColumn(name = "item_id")
    private List<Item> items = new ArrayList<>();

    private String name;

    private Double capacity;

    protected Inventory() {}

    public Long getId() { return id; }
    public List<Item> getItems() { return items; }
    public String getName() { return name; }
    public Double getCapacity() { return capacity; }

    public Double getAvailableSize() {
        Double currentlyOccupiedSize = this.getItems().stream()
                .mapToDouble(Item::getSize)
                .sum();
        return this.capacity - currentlyOccupiedSize;
    }

    public void addItem(Item item) {
        this.items.add(item);
    }
    public void removeItem(Item item) {
        this.items.remove(item);
    }
    public void setName(String name) { this.name = name; }
}
