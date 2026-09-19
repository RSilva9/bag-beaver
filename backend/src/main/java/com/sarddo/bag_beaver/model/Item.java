package com.sarddo.bag_beaver.model;


import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID item_id;

    private String name;

    private String description;

    private Double size ;


}
