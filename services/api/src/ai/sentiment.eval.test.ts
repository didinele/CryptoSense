import { describe, expect, it } from 'vitest';
import { runSentimentAgent, SentimentOutputSchema } from './sentiment';

describe('Sentiment Agent AI Evals', () => {

	it('should accurately classify a mix of positive and negative headlines', async () => {
		const symbol = 'BTC';
		const headlines = [
			'Bitcoin reaches stunning new all time high!',
			'Massive exchange hack loses millions of user funds.',
			'Bitcoin price remains stable during the weekend.'
		];

		const result = await runSentimentAgent(symbol, headlines);

		// Verificăm schema Zod
		const parsed = SentimentOutputSchema.safeParse(result);
		expect(parsed.success).toBe(true);
		
		// Verificăm logica/raționamentul (Evals)
		expect(result.news).toHaveLength(3);
		
		// Prima ar trebui sa fie pozitiva (desi e model AI, cerem strictețe pe cuvinte evidente)
		const positiveStory = result.news.find(n => n.headline.includes('high!'));
		expect(positiveStory).toBeDefined();
		expect(positiveStory?.polarity).toBe('positive');

		// A doua negativă
		const negativeStory = result.news.find(n => n.headline.includes('hack'));
		expect(negativeStory).toBeDefined();
		expect(negativeStory?.polarity).toBe('negative');

		// Scorul ar trebui sa fie in range 0-100
		expect(result.aggregateScore).toBeGreaterThanOrEqual(0);
		expect(result.aggregateScore).toBeLessThanOrEqual(100);
	}, 60000); // 60s timeout pt local LLM

});
