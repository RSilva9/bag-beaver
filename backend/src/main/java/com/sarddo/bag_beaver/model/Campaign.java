package com.sarddo.bag_beaver.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "campaigns")
public class Campaign {
    @Id
    private String code;

    private String name;

    private String dmSecret;

    private Integer nextPlayerId = 1;

    @OneToMany
    private List<Player> players;

}
