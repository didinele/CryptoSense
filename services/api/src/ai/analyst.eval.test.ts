import { describe, it, expect } from 'vitest';
import { runAnalystAgent, AnalystOutputSchema } from './analyst.js';

describe('AI Agent Evals: Analyst', () => {

	it('should gracefully respond with valid JSON structure when given normal prices', async () => {
		// Mock prices representing a 10% dump
		const mockPrices = [60000, 58000, 56000, 54000];
		
		const result = await runAnalystAgent('BTCUSDT', mockPrices);
		
		// Va arunca excepție automat dacă structura este invalidă.
		AnalystOutputSchema.parse(result);

		expect(result).toHaveProperty('trend');
		expect(result).toHaveProperty('support');
		expect(result).toHaveProperty('resistance');
		expect(result.reasoning).toBeTypeOf('string');
	}, 60000); // 60s timeout for local LLM generation

	it('should successfully detect high volatility (dump > 5%)', async () => {
		const volatilityPrices = [100, 96, 92, 85]; // Starts at 100, drops to 85 -> 15% drop.
		
		const result = await runAnalystAgent('FAKECOIN', volatilityPrices);
		expect(result.volatilityAlert).toBe(true);
		expect(Math.abs(result.volatilityPercentage)).toBeGreaterThanOrEqual(5);
	}, 60000); // 60s timeout for local LLM generation

});