package com.sarddo.bag_beaver.repository;

import com.sarddo.bag_beaver.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByItems_id(Long itemId);
}
