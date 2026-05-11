'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMe, useLogout } from '@/api/routes/auth';
import { useAnalyzeSymbol, type AnalysisData } from '@/api/routes/analysis';
import { useSentimentSymbol, type SentimentData } from '@/api/routes/sentiment';
import { useStrategist } from '@/api/routes/strategy';

export default function DashboardPage() {
	const { data: user, isLoading, isError } = useMe();
	const logout = useLogout();
	const router = useRouter();

	const strategist = useStrategist();

	const [symbol, setSymbol] = useState('BTCUSDT');
	const {
		data: rawAnalysis,
		isLoading: isAnalyzing,
		error: analyzeError,
		refetch: runAnalysis,
	} = useAnalyzeSymbol(symbol, { enabled: false });
	const analysis = rawAnalysis as AnalysisData | undefined;

	const {
		data: rawSentiment,
		isLoading: isAnalyzingSentiment,
		error: sentimentError,
		refetch: runSentiment,
	} = useSentimentSymbol(symbol, { enabled: false });
	const sentimentData = rawSentiment as SentimentData | undefined;

	useEffect(() => {
		if (isError) {
			router.push('/login');
		}
	}, [isError, router]);

	const handleLogout = async () => {
		await logout.mutateAsync();
		router.push('/login');
	};

	if (isLoading) {
		return <div className="p-8 text-white">Loading...</div>;
	}

	if (!user) {
		return null; // Will redirect
	}

	return (
		<div className="min-h-screen bg-gray-900 p-8 text-white">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold">CryptoSense Dashboard</h1>
					<div className="flex items-center gap-4">
						<span className="text-gray-400">{user?.username ?? 'User'}</span>
						<button
							className="rounded bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				</div>

				<div className="mb-6 rounded-lg bg-gray-800 p-6 shadow-md">
					<h2 className="mb-4 text-xl font-semibold">Epic 1: Auth Successful!</h2>
					<p className="text-gray-300">You are securely logged into the dashboard via JWT.</p>
				</div>

				<div className="rounded-lg bg-gray-800 p-6 shadow-md">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold">Epic 1.1: Market Data Sync</h2>
						<span className="rounded bg-indigo-900 px-3 py-1 text-xs font-semibold text-indigo-300">CRON Active</span>
					</div>
					<p className="text-gray-300">
						Data is being fetched real-time from Binance API in background (Every 5 minutes).
					</p>
				</div>

				<div className="mt-6 rounded-lg bg-gray-800 p-6 shadow-md">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold">Epic 2: Analyst Agent (AI)</h2>
						<div className="flex gap-2">
							<select
								value={symbol}
								onChange={(e) => setSymbol(e.target.value)}
								className="rounded bg-gray-700 px-3 py-1 text-sm text-white outline-none"
							>
								<option value="BTCUSDT">BTC/USDT</option>
								<option value="ETHUSDT">ETH/USDT</option>
								<option value="SOLUSDT">SOL/USDT</option>
								<option value="BNBUSDT">BNB/USDT</option>
								<option value="ADAUSDT">ADA/USDT</option>
							</select>
							<button
								className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
								onClick={() => runAnalysis()}
								disabled={isAnalyzing}
							>
								{isAnalyzing ? 'Thinking (Local LLM)...' : 'Run Analysis'}
							</button>
						</div>
					</div>

					{analyzeError && (
						<div className="rounded border border-red-700/50 bg-red-900/50 p-4 text-red-200">
							❌ Failed fetching analysis: {(analyzeError as any).message || 'Server Error'}
						</div>
					)}

					{analysis && (
						<div className="mt-4 space-y-4">
							{analysis.volatilityAlert && (
								<div className="flex items-center gap-2 rounded border border-yellow-600/50 bg-yellow-600/20 p-3 font-medium text-yellow-500">
									⚠️ Volatility Alert! The price fluctuated by {analysis.volatilityPercentage}% recently!
								</div>
							)}

							<div className="grid grid-cols-3 gap-4">
								<div className="rounded bg-gray-700 p-4">
									<p className="text-xs tracking-wider text-gray-400 uppercase">Trend</p>
									<p
										className={`text-lg font-bold capitalize ${
											analysis.trend === 'bullish'
												? 'text-green-400'
												: analysis.trend === 'bearish'
													? 'text-red-400'
													: 'text-gray-300'
										}`}
									>
										{analysis.trend}
									</p>
								</div>
								<div className="rounded bg-gray-700 p-4">
									<p className="text-xs tracking-wider text-gray-400 uppercase">Support</p>
									<p className="text-lg font-bold text-gray-200">${analysis.support}</p>
								</div>
								<div className="rounded bg-gray-700 p-4">
									<p className="text-xs tracking-wider text-gray-400 uppercase">Resistance</p>
									<p className="text-lg font-bold text-gray-200">${analysis.resistance}</p>
								</div>
							</div>

							<div className="rounded border-l-4 border-blue-500 bg-gray-900 p-4">
								<h3 className="mb-2 text-sm font-semibold text-gray-400">Agent's Reasoning</h3>
								<p className="text-sm leading-relaxed text-gray-300">{analysis.reasoning}</p>
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 rounded-lg bg-gray-800 p-6 shadow-md">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold">Epic 3: AI Sentiment Analysis</h2>
						<button
							className="rounded bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 disabled:opacity-50"
							onClick={() => runSentiment()}
							disabled={isAnalyzingSentiment}
						>
							{isAnalyzingSentiment ? 'Reading News (LLM)...' : 'Analyze News'}
						</button>
					</div>

					{sentimentError && (
						<div className="rounded border border-red-700/50 bg-red-900/50 p-4 text-red-200">
							❌ Failed fetching sentiment: {(sentimentError as any).message || 'Server Error'}
						</div>
					)}

					{sentimentData && (
						<div className="mt-4 space-y-6">
							<div className="flex items-center gap-6">
								<div className="flex-1">
									<p className="mb-1 text-sm font-medium text-gray-400">Aggregate Sentiment Score</p>
									<div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-700">
										<div
											className={`h-full transition-all ${
												sentimentData.aggregateScore > 55
													? 'bg-green-500'
													: sentimentData.aggregateScore < 45
														? 'bg-red-500'
														: 'bg-yellow-500'
											}`}
											style={{ width: `${sentimentData.aggregateScore}%` }}
										></div>
									</div>
									<div className="mt-1 flex justify-between text-xs font-bold">
										<span className="text-red-400">Bearish</span>
										<span className="text-gray-300">{sentimentData.aggregateScore} / 100</span>
										<span className="text-green-400">Bullish</span>
									</div>
								</div>

								<div className="min-w-[120px] rounded bg-gray-700 p-4 text-center">
									<p className="text-xs tracking-wider text-gray-400 uppercase">Overall</p>
									<p
										className={`text-xl font-bold capitalize ${
											sentimentData.sentiment === 'bullish'
												? 'text-green-400'
												: sentimentData.sentiment === 'bearish'
													? 'text-red-400'
													: 'text-yellow-400'
										}`}
									>
										{sentimentData.sentiment}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-gray-400">Recent Headlines Analysed</h3>
								<ul className="space-y-2">
									{sentimentData.news.map((item, idx) => (
										<li key={idx} className="flex items-start gap-3 rounded bg-gray-900 p-3">
											<span
												className={`rounded px-2 py-1 text-xs font-bold uppercase ${
													item.polarity === 'positive'
														? 'bg-green-500/20 text-green-400'
														: item.polarity === 'negative'
															? 'bg-red-500/20 text-red-400'
															: 'bg-gray-500/20 text-gray-400'
												}`}
											>
												{item.polarity}
											</span>
											<span className="text-sm text-gray-300">{item.headline}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 mb-12 rounded-lg border border-teal-500/30 bg-teal-900/30 p-6 shadow-md">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-teal-300">Epic 4: Strategy AI (Decision Maker)</h2>
						<button
							className="rounded bg-teal-600 px-6 py-2 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50"
							onClick={() => {
								if (analysis && sentimentData) {
									strategist.mutate({
										symbol,
										analystData: analysis,
										sentimentData,
									});
								}
							}}
							disabled={!analysis || !sentimentData || strategist.isPending}
						>
							{strategist.isPending ? 'Thinking...' : 'Get AI Recommendation'}
						</button>
					</div>

					{(!analysis || !sentimentData) && (
						<p className="text-sm text-gray-400 italic">
							You need to run both the Analysis (Epic 2) and Sentiment (Epic 3) first to unlock the Strategy AI.
						</p>
					)}

					{strategist.error && (
						<div className="mt-4 rounded border border-red-700/50 bg-red-900/50 p-4 text-red-200">
							❌ Failed fetching strategy: {(strategist.error as any).message || 'Server Error'}
						</div>
					)}

					{strategist.data && (
						<div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-900 p-6">
							<h3 className="mb-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">Final Verdict</h3>
							<div
								className={`mb-4 text-5xl font-black ${
									strategist.data.recommendation === 'BUY'
										? 'text-green-500'
										: strategist.data.recommendation === 'SELL'
											? 'text-red-500'
											: 'text-yellow-500'
								}`}
							>
								{strategist.data.recommendation}
							</div>

							<div className="mb-6 rounded-full bg-gray-800 px-4 py-1 text-sm font-medium">
								Confidence: <span className="text-white">{strategist.data.confidence}%</span>
							</div>

							<div className="w-full max-w-2xl text-center">
								<p className="text-lg leading-relaxed text-gray-300 italic">"{strategist.data.explanation}"</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
