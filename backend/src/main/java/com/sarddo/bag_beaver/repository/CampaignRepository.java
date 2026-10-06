package com.sarddo.bag_beaver.repository;

import com.sarddo.bag_beaver.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, String> {
}
