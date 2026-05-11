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
	Dacă diferența procentuală DINTRE PRIMUL PREȚ ȘI ULTIMUL PREȚ din array depășește 5%, indiferent că este creștere sau scădere (volatilitate absolută), setează volatilityAlert la true și menționează volatilityPercentage NUMAI CA NUMĂR întreg sau floating point brut, FĂRĂ simbolul de procente. Fii extrem de atent la calcule matematice: (ultimul - primul)/primul * 100.
	Dacă diferența procentuală ESTE MAI MICĂ de 5%, volatilityAlert = false și volatilityPercentage = 0.
	
	Răspunde STRICT folosind următoarea structură JSON, fără nimic altceva, folosind delimitatori:
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
		const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'llama3', // Trecem la Llama 3 (8B parametri), net superior matematic
				prompt: prompt,
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
