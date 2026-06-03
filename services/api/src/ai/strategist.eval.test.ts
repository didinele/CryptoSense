import { describe, expect, it } from 'vitest';
import { runStrategistAgent, StrategistOutputSchema } from './strategist.js';

const bullishAnalyst = {
	trend: 'bullish',
	support: 58_000,
	resistance: 65_000,
	volatilityAlert: false,
	volatilityPercentage: 0,
	reasoning: 'Prices have been steadily increasing.',
};

const bearishAnalyst = {
	trend: 'bearish',
	support: 28_000,
	resistance: 34_000,
	volatilityAlert: true,
	volatilityPercentage: -12,
	reasoning: 'Sharp decline detected across the period.',
};

const bullishSentiment = {
	aggregateScore: 75,
	sentiment: 'bullish',
	news: [{ headline: 'Bitcoin adoption soars globally', polarity: 'positive' }],
};

const bearishSentiment = {
	aggregateScore: 25,
	sentiment: 'bearish',
	news: [{ headline: 'Major exchange collapses', polarity: 'negative' }],
};

describe('AI Agent Evals: Strategist', () => {

	it('should return a valid schema-conformant response for bullish inputs', async () => {
		const result = await runStrategistAgent('BTCUSDT', bullishAnalyst, bullishSentiment);

		StrategistOutputSchema.parse(result);

		expect(['BUY', 'SELL', 'HOLD']).toContain(result.recommendation);
		expect(result.confidence).toBeGreaterThanOrEqual(0);
		expect(result.confidence).toBeLessThanOrEqual(100);
		expect(result.explanation).toBeTypeOf('string');
		expect(result.explanation.length).toBeGreaterThan(0);
	}, 60_000);

	it('should recommend BUY or HOLD (not SELL) when both analyst and sentiment are bullish (fallback logic)', async () => {
		// Force fallback by using inputs that match the deterministic fallback path
		const result = await runStrategistAgent('BTCUSDT', bullishAnalyst, bullishSentiment);

		StrategistOutputSchema.parse(result);
		// Both signals bullish — should not be SELL
		expect(result.recommendation).not.toBe('SELL');
	}, 60_000);

	it('should recommend SELL or HOLD (not BUY) when both analyst and sentiment are bearish (fallback logic)', async () => {
		const result = await runStrategistAgent('BTCUSDT', bearishAnalyst, bearishSentiment);

		StrategistOutputSchema.parse(result);
		expect(result.recommendation).not.toBe('BUY');
	}, 60_000);

});
