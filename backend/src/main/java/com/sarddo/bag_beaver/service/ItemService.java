package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.Inventory;
import com.sarddo.bag_beaver.model.Item;
import com.sarddo.bag_beaver.repository.InventoryRepository;
import com.sarddo.bag_beaver.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final InventoryRepository inventoryRepository;

    public ItemService(ItemRepository itemRepository, InventoryRepository inventoryRepository) {
        this.itemRepository = itemRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public Item createItem(String name, String description, Double size) {
        Item item = new Item(name, description, size);
        itemRepository.save(item);
        return item;
    }

    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        itemRepository.delete(item);
    }

    @Transactional
    public void changeItemSize(Long itemId, Double size) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        Optional<Inventory> inventoryThatHasItem = inventoryRepository.findByItems_id(itemId);
        if(inventoryThatHasItem.isPresent()){
            if(inventoryThatHasItem.get().hasEnoughCapacity(size)){
                item.setSize(size);
            } else {
                throw new IllegalStateException("Not enough space in inventory");
            }
        } else {
            item.setSize(size);
        }
    }

    public void changeItemName(Long itemId, String name) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        item.setName(name);
    }

    public void changeItemDescription(Long itemId, String description) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        item.setDescription(description);
    }
}
