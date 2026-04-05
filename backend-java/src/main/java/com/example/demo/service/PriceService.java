package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class PriceService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Double getCurrentPrice(String ticker) {
        // Curățăm ticker-ul de eventuale spații goale invizibile
        String cleanTicker = ticker.trim().toUpperCase();

        try {
            if (cleanTicker.equals("BTC")) {
                String url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
                // Facem apelul și verificăm dacă primim răspuns
                Map response = restTemplate.getForObject(url, Map.class);

                if (response != null && response.containsKey("bitcoin")) {
                    Map bitcoinData = (Map) response.get("bitcoin");
                    return Double.valueOf(bitcoinData.get("usd").toString());
                }
            }

            // Pentru Apple (AAPL) sau altele, punem un preț fix dar realist
            return cleanTicker.equals("AAPL") ? 185.0 : 100.0;

        } catch (Exception e) {
            // ACESTA ESTE PASUL CRUCIAL: Vei vedea eroarea în consola IntelliJ (tab-ul Run)
            System.err.println("EROARE API pentru " + cleanTicker + ": " + e.getMessage());
            return 150.0;
        }
    }
}