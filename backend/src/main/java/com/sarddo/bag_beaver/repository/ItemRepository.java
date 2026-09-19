package com.sarddo.bag_beaver.repository;

import com.sarddo.bag_beaver.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
