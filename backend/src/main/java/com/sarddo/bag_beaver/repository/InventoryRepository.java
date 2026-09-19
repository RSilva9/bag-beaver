package com.sarddo.bag_beaver.repository;

import com.sarddo.bag_beaver.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
}
