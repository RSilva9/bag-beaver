package com.sarddo.bag_beaver.service;

import com.sarddo.bag_beaver.model.Item;
import com.sarddo.bag_beaver.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ItemService {
    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public void createItem(String name, String description, Double size) {
        itemRepository.save(
                new Item(name, description, size)
        );
    }

    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        itemRepository.delete(item);
    }

    public void changeItemSize(Long itemId, Double size) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
        item.setSize(size);
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
