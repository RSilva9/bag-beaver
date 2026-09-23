package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.Inventory;
import com.sarddo.bag_beaver.model.Item;
import com.sarddo.bag_beaver.repository.InventoryRepository;
import com.sarddo.bag_beaver.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final ItemRepository itemRepository;

    public InventoryService(InventoryRepository inventoryRepository, ItemRepository itemRepository) {
        this.inventoryRepository = inventoryRepository;
        this.itemRepository = itemRepository;
    }

    public void addItemToInventory(Long itemId, Long inventoryId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found."));
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found."));
        inventory.addItem(item);
    }

    public void discardItem(Long itemId, Long inventoryId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found."));
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found."));
        inventory.removeItem(item);
        itemRepository.delete(item);
    }

    public void moveItem(Item item, Inventory from, Inventory to) {
        if(!from.getItems().contains(item)) {
            throw new EntityNotFoundException("Player does not have the selected item.");
        }

        from.removeItem(item);
        to.addItem(item);
    }
}