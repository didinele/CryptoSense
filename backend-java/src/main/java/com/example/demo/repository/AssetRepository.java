package com.example.demo.repository;

import com.example.demo.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    // Aici vom putea adăuga ulterior metode de căutare specifice
}