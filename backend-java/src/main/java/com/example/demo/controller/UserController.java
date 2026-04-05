package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Asset;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AssetRepository;
import com.example.demo.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //
@RequestMapping("/api/users")
public class UserController {

    @Autowired //
    private UserRepository userRepository;

    @Autowired //
    private AssetRepository assetRepository;

    @Autowired //
    private PortfolioService portfolioService;

    // 1. Vezi toți utilizatorii
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. Creezi un utilizator nou
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // 3. Vezi valoarea investiției inițiale (bazată pe prețul de cumpărare)
    @GetMapping("/{userId}/total-investment")
    public Double getTotalInvestment(@PathVariable Long userId) {
        return portfolioService.calculateTotalInvestment(userId);
    }

    // 4. Vezi valoarea curentă a portofoliului (cu prețuri simulate live)
    @GetMapping("/{userId}/current-value")
    public Double getCurrentValue(@PathVariable Long userId) {
        return portfolioService.calculateCurrentPortfolioValue(userId);
    }

    // 5. Adaugi o acțiune (Asset) unui utilizator
    @PostMapping("/{userId}/assets")
    public Asset addAssetToUser(@PathVariable Long userId, @RequestBody Asset asset) {
        return userRepository.findById(userId).map(user -> {
            asset.setUser(user);
            return assetRepository.save(asset);
        }).orElseThrow(() -> new RuntimeException("Utilizatorul cu ID " + userId + " nu există!"));
    }

    // Această metodă lipsește în imaginile tale actuale!
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}