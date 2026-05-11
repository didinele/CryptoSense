import { setTimeout, clearTimeout } from 'node:timers';
import { z } from 'zod';

export const NewsItemSchema = z.object({
	headline: z.string(),
	polarity: z.enum(['positive', 'negative', 'neutral']),
});

export const SentimentOutputSchema = z.object({
	news: z.array(NewsItemSchema),
	aggregateScore: z.number().min(0).max(100),
	sentiment: z.enum(['bullish', 'bearish', 'neutral']),
});

export type SentimentOutput = z.infer<typeof SentimentOutputSchema>;

/**
 * Agentul de Sentiment: Primește titluri/șuri de știri și returnează un JSON cu polaritatea fiecărei știri și un scor agregat.
 */
export async function runSentimentAgent(symbol: string, newsHeadlines: string[]): Promise<SentimentOutput> {
	if (newsHeadlines.length === 0) {
		throw new Error('Nu există știri furnizate.');
	}

	const prompt = `
	Ești un analist financiar expert care analizează sentimentul știrilor despre criptomonede.
	Următoarele sunt ultimele știri pentru moneda ${symbol}:
	${newsHeadlines.map((h, i) => `\${i + 1}. ${h}`).join('\n')}
	
	Sarcini:
	1. Clasifică polaritatea fiecărei știri (strict 'positive', 'negative' sau 'neutral').
	2. Calculează un scor de sentiment agregat între 0 și 100, unde 0 este panică extremă (toate rele) și 100 este euforie extremă (toate foarte bune), 50 fiind neutru.
	3. Stabilește un sentiment general (bullish/bearish/neutral).
	
	Răspunde STRICT cu un singur obiect JSON valabil conform acestei structuri:
	{
		"news": [
			{ "headline": "textul știrii exact", "polarity": "positive" | "negative" | "neutral" }
		],
		"aggregateScore": numar_intre_0_si_100,
		"sentiment": "bullish" | "bearish" | "neutral"
	}
	Nu adăuga niciun alt text, sfat sau cod markdown în afară de JSON brut.
	`;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30 second timeout

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
			console.warn('[AI] Local LLM Fetch failed. Fallback to algorithmic sentiment.');
			return fallbackSentimentAnalysis(newsHeadlines);
		}

		const data = (await response.json()) as { response: string };
		const parsedJson = JSON.parse(data.response);
		return SentimentOutputSchema.parse(parsedJson);
	} catch (error) {
		console.error('[AI Eval/Agent] Failed generating sentiment response, returning fallback:', error);
		return fallbackSentimentAnalysis(newsHeadlines);
	}
}

// Fallback dacă nu răspunde AI-ul local (ex. ollama down)
function fallbackSentimentAnalysis(headlines: string[]): SentimentOutput {
	const positiveWords = [
		'surge',
		'gain',
		'adoption',
		'up',
		'ath',
		'high',
		'new',
		'good',
		'approved',
		'bullish',
		'rally',
		'pump',
		'moon',
	];
	const negativeWords = ['crash', 'drop', 'ban', 'down', 'hack', 'bad', 'panic', 'bearish', 'dump', 'plunge', 'rug'];

	let score = 50;
	const news = headlines.map((h) => {
		const lower = h.toLowerCase();
		const hasPos = positiveWords.some((w) => lower.includes(w));
		const hasNeg = negativeWords.some((w) => lower.includes(w));
		let pol: 'negative' | 'neutral' | 'positive' = 'neutral';
		if (hasPos && !hasNeg) {
			pol = 'positive';
			score += 5;
		} else if (hasNeg && !hasPos) {
			pol = 'negative';
			score -= 5;
		}

		return { headline: h, polarity: pol };
	});

	score = Math.max(0, Math.min(100, score));
	const sentiment = score > 55 ? 'bullish' : score < 45 ? 'bearish' : 'neutral';

	return {
		news,
		aggregateScore: score,
		sentiment,
	};
}
