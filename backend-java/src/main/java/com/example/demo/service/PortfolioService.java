package com.example.demo.service;

import com.example.demo.model.Asset;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service //
public class PortfolioService {

    @Autowired
    private UserRepository userRepository; //

    @Autowired
    private PriceService priceService; // Serviciul care aduce prețurile "live"

    /**
     * Calculează valoarea portofoliului bazată pe prețul de achiziție (Investiția inițială).
     */
    public Double calculateTotalInvestment(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizator negăsit!"));

        List<Asset> assets = user.getAssets();
        if (assets == null || assets.isEmpty()) return 0.0;

        return assets.stream()
                .mapToDouble(asset -> asset.getQuantity() * asset.getPurchasePrice())
                .sum();
    }

    /**
     * Calculează valoarea portofoliului bazată pe prețurile curente din piață.
     */
    public Double calculateCurrentPortfolioValue(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizator negăsit!"));

        List<Asset> assets = user.getAssets();
        if (assets == null || assets.isEmpty()) return 0.0;

        return assets.stream()
                .mapToDouble(asset -> {
                    // Luăm prețul "live" pentru fiecare acțiune în parte
                    Double currentPrice = priceService.getCurrentPrice(asset.getTicker());
                    return asset.getQuantity() * currentPrice;
                })
                .sum();
    }
}