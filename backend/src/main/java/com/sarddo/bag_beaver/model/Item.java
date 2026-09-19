package com.sarddo.bag_beaver.model;


import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private Double size;

    @OneToOne(optional = true)
    @JoinColumn(name = "inventory_id")
    private Inventory bag;

    protected Item() {}

    public Item(String name, String description, Double size) {
        this.name = name;
        this.description = description;
        this.size = size;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getSize() { return size; }
    public Inventory getBag() { return bag; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setSize(Double size) { this.size = size; }
}
