package com.sarddo.bag_beaver.repository;

import com.sarddo.bag_beaver.model.DroppedItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DroppedItemRepository extends JpaRepository<DroppedItem, Long> {
    Optional<DroppedItem> findByCampaign_CodeAndItem_Id(String campaignCode, Long itemId);
}