import process from 'node:process';
import { setTimeout, clearTimeout } from 'node:timers';
import { z } from 'zod';

export const AnalystOutputSchema = z.object({
	trend: z.enum(['bullish', 'bearish', 'neutral']),
	support: z.number(),
	resistance: z.number(),
	volatilityAlert: z.boolean(),
	volatilityPercentage: z.number(),
	reasoning: z.string(),
});

export type AnalystOutput = z.infer<typeof AnalystOutputSchema>;

/**
 * Agentul Analist: Primește date istorice de preț și trimite un request către un LLM local
 * (compatibil cu endpoint-urile OpenAI, ex: Ollama/Gemma local) pentru a returna o analiză tehnică structurată în JSON.
 */
export async function runAnalystAgent(symbol: string, prices: number[]): Promise<AnalystOutput> {
	if (prices.length === 0) {
		throw new Error('Nu există date suficiente pentru analiză.');
	}

	const prompt = `
	Ești un analist tehnic crypto expert.
	Analizează următoarele prețuri recente pentru ${symbol}: ${prices.join(', ')}.
	Te rog să extragi nivelul de suport (cel mai mic punct recent), nivelul de rezistență (cel mai mare punct recent) și să declari un trend (bullish/bearish/neutral).

	CALCULUL VOLATILITĂȚII (urmează pașii în ordine):
	Pasul 1: primul_pret = primul număr din array, ultimul_pret = ultimul număr din array.
	Pasul 2: volatilityPercentage = ABS((ultimul_pret - primul_pret) / primul_pret * 100)
	Pasul 3: Compară cu pragul de 5%:
	  - DACĂ volatilityPercentage > 5 → volatilityAlert = true, păstrează valoarea calculată
	  - DACĂ volatilityPercentage <= 5 → volatilityAlert = false, volatilityPercentage = 0

	Exemplu corect pentru prețuri stabile [100, 101, 99, 100.5]:
	  volatilityPercentage = ABS((100.5 - 100) / 100 * 100) = 0.5
	  0.5 <= 5 → volatilityAlert = false, volatilityPercentage = 0

	Exemplu corect pentru dump [100, 90, 85, 80]:
	  volatilityPercentage = ABS((80 - 100) / 100 * 100) = ABS(-20) = 20
	  20 > 5 → volatilityAlert = true, volatilityPercentage = 20

	Exemplu corect pentru rally major [2000, 2300, 2500, 2700]:
	  volatilityPercentage = ABS((2700 - 2000) / 2000 * 100) = ABS(700 / 2000 * 100) = ABS(35) = 35
	  35 > 5 → volatilityAlert = true, volatilityPercentage = 35

	Răspunde STRICT folosind următoarea structură JSON, fără nimic altceva:
	{
		"trend": "bullish" | "bearish" | "neutral",
		"support": număr,
		"resistance": număr,
		"volatilityAlert": boolean,
		"volatilityPercentage": număr procentual brut,
		"reasoning": "scurtă explicație tehnică"
	}
	`;

	try {
		// Aici configurăm apelul către un model LLM rulat local (ex. Ollama API)
		// Prin intermediul portului standard 11434, specific pentru modele locale (Gemma, LLaMa)
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30 second timeout

		const response = await fetch(`${process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434'}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'llama3', // Trecem la Llama 3 (8B parametri), net superior matematic
				prompt,
				stream: false,
				format: 'json',
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			console.warn('[AI] Local LLM Fetch failed. Fallback to algorithmic calculation for MVP.');
			return fallbackAlgorithmicAnalysis(prices);
		}

		const data = (await response.json()) as { response: string };
		const parsedJson = JSON.parse(data.response);
		return AnalystOutputSchema.parse(parsedJson);
	} catch (error) {
		console.error('[AI Eval/Agent] Failed generating AI response, returning fallback:', error);
		return fallbackAlgorithmicAnalysis(prices);
	}
}

// Fallback logic in cazul in care Ollama / LLM-ul local nu ruleaza,
// pentru ca aplicatia si testele sa nu se rupa complet (fail-safe environment).
function fallbackAlgorithmicAnalysis(prices: number[]): AnalystOutput {
	const min = Math.min(...prices);
	const max = Math.max(...prices);
	const start = prices[0] ?? 0;
	const end = prices[prices.length - 1] ?? 0;

	const diff = end - start;
	const pct = start > 0 ? (diff / start) * 100 : 0;
	const isVolatile = Math.abs(pct) > 5;

	return {
		trend: pct > 0 ? 'bullish' : pct < 0 ? 'bearish' : 'neutral',
		support: min,
		resistance: max,
		volatilityAlert: isVolatile,
		volatilityPercentage: Number(pct.toFixed(2)),
		reasoning: 'Algorithmic fallback (LLM Local inaccesibil).',
	};
}
