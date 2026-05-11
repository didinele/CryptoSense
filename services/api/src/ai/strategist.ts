import { setTimeout, clearTimeout } from 'node:timers';
import { z } from 'zod';

export const StrategistOutputSchema = z.object({
	recommendation: z.enum(['BUY', 'SELL', 'HOLD']),
	confidence: z.number().min(0).max(100),
	explanation: z.string(),
});

export type StrategistOutput = z.infer<typeof StrategistOutputSchema>;

/**
 * Agentul Strateg: Primește outputul de la Agentul Analist și de la Agentul de Sentiment
 * și emite o recomandare finală de invesțitie.
 */
export async function runStrategistAgent(
	symbol: string,
	analystData: any,
	sentimentData: any,
): Promise<StrategistOutput> {
	const prompt = `
	Ești un strateg de investiții Crypto expert.
	Activ: ${symbol}
	
	CONCLUZII ANALIST TEHNIC:
	Trend: ${analystData.trend}
	Suport: ${analystData.support} | Rezistență: ${analystData.resistance}
	Volatilitate: ${analystData.volatilityAlert ? 'DA (' + analystData.volatilityPercentage + '%)' : 'NU'}
	
	CONCLUZII SENTIMENT ȘTIRI:
	Sentiment General: ${sentimentData.sentiment}
	Scor Agregat: ${sentimentData.aggregateScore}/100
	
	Ești obligat să alegi una dintre următoarele decizii: BUY, SELL, sau HOLD.
	Scrie o scurtă 'explanation' bazată strict pe datele primite (NU inventa prețuri noi).
	Acordă un scor de încredere 'confidence' (între 0 și 100).
	
	Răspunde STRICT folosind următoarea structură JSON:
	{
		"recommendation": "BUY" | "SELL" | "HOLD",
		"confidence": numar_0_100,
		"explanation": "paragraf scurt"
	}
	`;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30_000);

		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'llama3',
				prompt,
				stream: false,
				format: 'json',
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			console.warn('[AI] Local LLM Fetch failed. Fallback to algorithmic strategy.');
			return fallbackStrategistDecision(analystData, sentimentData);
		}

		const data = (await response.json()) as { response: string };
		const parsedJson = JSON.parse(data.response);
		return StrategistOutputSchema.parse(parsedJson);
	} catch (error) {
		console.error('[AI Eval/Agent] Failed generating strategy response, returning fallback:', error);
		return fallbackStrategistDecision(analystData, sentimentData);
	}
}

// Fallback determinist dacă Ollama pică
function fallbackStrategistDecision(analystData: any, sentimentData: any): StrategistOutput {
	const score = sentimentData.aggregateScore;
	const isBullishTech = analystData.trend === 'bullish';

	if (score > 60 && isBullishTech) {
		return { recommendation: 'BUY', confidence: 85, explanation: 'Trendul și sentimentul sunt puternic favorabile.' };
	} else if (score < 40 && !isBullishTech) {
		return {
			recommendation: 'SELL',
			confidence: 80,
			explanation: 'Atenție la scăderi, ambii indicatori sunt negativi.',
		};
	} else {
		return {
			recommendation: 'HOLD',
			confidence: 60,
			explanation: 'Datele sunt mixte. Așteptăm o confirmare mai clară.',
		};
	}
}
