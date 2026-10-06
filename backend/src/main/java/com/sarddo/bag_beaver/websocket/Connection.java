package com.sarddo.bag_beaver.websocket;

import com.sarddo.bag_beaver.model.PlayerRole;

public record Connection(String campaignCode, Long playerId, PlayerRole role) {
}
