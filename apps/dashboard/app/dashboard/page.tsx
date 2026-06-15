'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { APIError } from '@/api/error';
import { useAnalyzeSymbol, type AnalysisData } from '@/api/routes/analysis';
import { useMe, useLogout } from '@/api/routes/auth';
import { useSubmitFeedback } from '@/api/routes/feedback';
import { useSentimentSymbol, type SentimentData } from '@/api/routes/sentiment';
import { useStrategist } from '@/api/routes/strategy';
import { useGetUserSymbols, useAddUserSymbol, useRemoveUserSymbol } from '@/api/routes/userSymbols';

type PipelinePhase = 'analyzing' | 'idle' | 'strategizing';

export default function DashboardPage() {
	const { data: user, isLoading, isError, isFetching } = useMe();
	const logout = useLogout();
	const router = useRouter();

	const { data: symbolsData, isLoading: isLoadingSymbols } = useGetUserSymbols();
	const addSymbol = useAddUserSymbol();
	const removeSymbol = useRemoveUserSymbol();
	const [newSymbolInput, setNewSymbolInput] = useState('');
	const trackedSymbols = useMemo(() => symbolsData?.symbols ?? [], [symbolsData]);

	const [symbol, setSymbol] = useState('');
	useEffect(() => {
		if (trackedSymbols.length > 0 && !trackedSymbols.includes(symbol)) {
			setSymbol(trackedSymbols[0]!);
		} else if (trackedSymbols.length === 0) {
			setSymbol('');
		}
	}, [trackedSymbols, symbol]);

	const [pipelinePhase, setPipelinePhase] = useState<PipelinePhase>('idle');
	const [feedbackGiven, setFeedbackGiven] = useState<'negative' | 'positive' | null>(null);

	const { data: rawAnalysis, error: analyzeError, refetch: runAnalysis } = useAnalyzeSymbol(symbol, { enabled: false });
	const analysis = rawAnalysis as AnalysisData | undefined;

	const {
		data: rawSentiment,
		error: sentimentError,
		refetch: runSentiment,
	} = useSentimentSymbol(symbol, { enabled: false });
	const sentimentData = rawSentiment as SentimentData | undefined;

	const strategist = useStrategist();
	const { reset: resetStrategist } = strategist;
	const submitFeedback = useSubmitFeedback();

	useEffect(() => {
		resetStrategist();
		setFeedbackGiven(null);
	}, [symbol, resetStrategist]);

	useEffect(() => {
		if (!isFetching && isError) router.push('/login');
	}, [isFetching, isError, router]);

	const handleLogout = async () => {
		await logout.mutateAsync();
		router.push('/login');
	};

	const handleAddSymbol = async () => {
		const value = newSymbolInput.trim().toUpperCase();
		if (!value) return;
		await addSymbol.mutateAsync(value);
		setNewSymbolInput('');
	};

	const handleAnalyze = async () => {
		setPipelinePhase('analyzing');
		setFeedbackGiven(null);
		strategist.reset();

		const [analysisResult, sentimentResult] = await Promise.all([runAnalysis(), runSentiment()]);

		const analystData = analysisResult.data as AnalysisData | undefined;
		const sentiment = sentimentResult.data as SentimentData | undefined;

		if (analystData && sentiment) {
			setPipelinePhase('strategizing');
			strategist.mutate(
				{ symbol, analystData, sentimentData: sentiment },
				{ onSettled: () => setPipelinePhase('idle') },
			);
		} else {
			setPipelinePhase('idle');
		}
	};

	if (isLoading) return <div className="p-8 text-white">Loading...</div>;
	if (!user) return null;

	const noSymbols = !isLoadingSymbols && trackedSymbols.length === 0;
	const isBusy = pipelinePhase !== 'idle';

	return (
		<div className="min-h-screen bg-gray-900 p-8 text-white">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold">Dashboard</h1>
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

				{/* Tracked Pairs */}
				<div className="rounded-lg bg-gray-800 p-6 shadow-md">
					<h2 className="mb-4 text-xl font-semibold">Tracked Pairs</h2>
					{isLoadingSymbols ? (
						<p className="text-sm text-gray-400">Loading...</p>
					) : (
						<>
							{trackedSymbols.length > 0 ? (
								<div className="mb-4 flex flex-wrap gap-2">
									{trackedSymbols.map((s) => (
										<span
											className="flex items-center gap-2 rounded-full bg-gray-700 px-3 py-1 text-sm font-medium"
											key={s}
										>
											{s}
											<button
												className="text-gray-400 hover:text-red-400 disabled:opacity-40"
												disabled={removeSymbol.isPending || isBusy}
												onClick={() => removeSymbol.mutate(s)}
											>
												✕
											</button>
										</span>
									))}
								</div>
							) : (
								<p className="mb-4 text-sm text-gray-400 italic">No pairs tracked yet. Add one below to get started.</p>
							)}
							<div className="flex gap-2">
								<input
									className="flex-1 rounded bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
									disabled={addSymbol.isPending}
									onChange={(e) => setNewSymbolInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') void handleAddSymbol();
									}}
									placeholder="e.g. DOGEUSDT"
									value={newSymbolInput}
								/>
								<button
									className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
									disabled={addSymbol.isPending || !newSymbolInput.trim()}
									onClick={() => void handleAddSymbol()}
								>
									{addSymbol.isPending ? 'Adding...' : 'Add Pair'}
								</button>
							</div>
							{addSymbol.error && (
								<p className="mt-2 text-sm text-red-400">{(addSymbol.error as any).message || 'Failed to add pair.'}</p>
							)}
						</>
					)}
				</div>

				{/* Analysis — hidden until at least one pair is tracked */}
				{!noSymbols && (
					<>
						{/* Symbol selector + single Analyze trigger */}
						<div className="mt-6 flex items-center justify-between rounded-lg bg-gray-700/50 px-6 py-4">
							<select
								className="rounded bg-gray-700 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
								disabled={isBusy}
								onChange={(e) => {
									setSymbol(e.target.value);
								}}
								value={symbol}
							>
								{trackedSymbols.map((s) => (
									<option key={s} value={s}>
										{s.replace('USDT', '/USDT')}
									</option>
								))}
							</select>
							<button
								className="rounded bg-teal-600 px-6 py-2 text-sm font-bold hover:bg-teal-500 disabled:opacity-50"
								disabled={isBusy}
								onClick={() => void handleAnalyze()}
							>
								{pipelinePhase === 'analyzing'
									? 'Analyzing...'
									: pipelinePhase === 'strategizing'
										? 'Generating strategy...'
										: `Analyze ${symbol}`}
							</button>
						</div>

						{/* Price Analysis + News Sentiment */}
						<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Price Analysis */}
							<div className="rounded-lg bg-gray-800 p-6 shadow-md">
								<h2 className="mb-4 text-lg font-semibold">Price Analysis</h2>

								{pipelinePhase === 'analyzing' && (
									<p className="text-sm text-gray-400 italic">Analyzing price data...</p>
								)}

								{analyzeError && pipelinePhase === 'idle' && (
									<div className="rounded border border-red-700/50 bg-red-900/50 p-4 text-sm text-red-200">
										{(analyzeError as any).message || 'Server Error'}
									</div>
								)}

								{analysis && pipelinePhase !== 'analyzing' && (
									<div className="space-y-4">
										{analysis.volatilityAlert && (
											<div className="rounded border border-yellow-600/50 bg-yellow-600/20 p-3 text-sm font-medium text-yellow-500">
												⚠️ Price moved {analysis.volatilityPercentage}% recently
											</div>
										)}
										<div className="grid grid-cols-3 gap-3">
											<div className="rounded bg-gray-700 p-3">
												<p className="text-xs tracking-wider text-gray-400 uppercase">Trend</p>
												<p
													className={`text-[1rem] font-bold capitalize ${analysis.trend === 'bullish' ? 'text-green-400' : analysis.trend === 'bearish' ? 'text-red-400' : 'text-gray-300'}`}
												>
													{analysis.trend}
												</p>
											</div>
											<div className="rounded bg-gray-700 p-3">
												<p className="text-xs tracking-wider text-gray-400 uppercase">Support</p>
												<p className="text-[1rem] font-bold text-gray-200">${analysis.support}</p>
											</div>
											<div className="rounded bg-gray-700 p-3">
												<p className="text-xs tracking-wider text-gray-400 uppercase">Resistance</p>
												<p className="text-[1rem] font-bold text-gray-200">${analysis.resistance}</p>
											</div>
										</div>
										<div className="rounded border-l-4 border-blue-500 bg-gray-900 p-4">
											<p className="mb-1 text-xs font-semibold text-gray-400">Reasoning</p>
											<p className="text-sm leading-relaxed text-gray-300">{analysis.reasoning}</p>
										</div>
									</div>
								)}

								{!analysis && pipelinePhase === 'idle' && !analyzeError && (
									<p className="text-sm text-gray-500 italic">Run an analysis to see price insights.</p>
								)}
							</div>

							{/* News Sentiment */}
							<div className="rounded-lg bg-gray-800 p-6 shadow-md">
								<h2 className="mb-4 text-lg font-semibold">News Sentiment</h2>

								{pipelinePhase === 'analyzing' && (
									<p className="text-sm text-gray-400 italic">Reading latest headlines...</p>
								)}

								{sentimentError &&
									pipelinePhase === 'idle' &&
									(sentimentError instanceof APIError && sentimentError.statusCode === 404 ? (
										<div className="rounded border border-blue-700/50 bg-blue-900/20 p-4 text-sm text-blue-300">
											News data for this pair is still being collected. Check back in a few minutes.
										</div>
									) : (
										<div className="rounded border border-red-700/50 bg-red-900/50 p-4 text-sm text-red-200">
											{(sentimentError as any).message || 'Server Error'}
										</div>
									))}

								{sentimentData && pipelinePhase !== 'analyzing' && (
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="flex-1">
												<div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-700">
													<div
														className={`h-full transition-all ${sentimentData.aggregateScore > 55 ? 'bg-green-500' : sentimentData.aggregateScore < 45 ? 'bg-red-500' : 'bg-yellow-500'}`}
														style={{ width: `${sentimentData.aggregateScore}%` }}
													/>
												</div>
												<div className="mt-1 flex justify-between text-xs font-bold">
													<span className="text-red-400">Bearish</span>
													<span className="text-gray-300">{sentimentData.aggregateScore}/100</span>
													<span className="text-green-400">Bullish</span>
												</div>
											</div>
											<div className="rounded bg-gray-700 px-3 py-2 text-center">
												{(() => {
													const label =
														sentimentData.aggregateScore > 55
															? 'bullish'
															: sentimentData.aggregateScore < 45
																? 'bearish'
																: 'neutral';
													return (
														<p
															className={`text-sm font-bold capitalize ${label === 'bullish' ? 'text-green-400' : label === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}
														>
															{label}
														</p>
													);
												})()}
											</div>
										</div>
										<div>
											<p className="mb-1.5 text-xs font-semibold text-gray-400">Headlines</p>
											<ul className="max-h-48 space-y-1.5 overflow-y-auto">
												{sentimentData.news.map((item, idx) => (
													<li className="flex items-start gap-2 rounded bg-gray-900 p-2 text-xs" key={idx}>
														<span
															className={`shrink-0 rounded px-1.5 py-0.5 font-bold uppercase ${item.polarity === 'positive' ? 'bg-green-500/20 text-green-400' : item.polarity === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}
														>
															{item.polarity}
														</span>
														<span className="text-gray-300">{item.headline}</span>
													</li>
												))}
											</ul>
										</div>
									</div>
								)}

								{!sentimentData && pipelinePhase === 'idle' && !sentimentError && (
									<p className="text-sm text-gray-500 italic">Run an analysis to see sentiment.</p>
								)}
							</div>
						</div>

						{/* Trade Strategy */}
						<div className="mt-6 mb-12 rounded-lg border border-teal-500/30 bg-teal-900/30 p-6 shadow-md">
							<h2 className="mb-4 text-xl font-semibold text-teal-300">Trade Strategy</h2>

							{pipelinePhase === 'strategizing' && (
								<p className="text-sm text-gray-400 italic">Generating recommendation...</p>
							)}

							{strategist.error && pipelinePhase === 'idle' && (
								<div className="rounded border border-red-700/50 bg-red-900/50 p-4 text-red-200">
									{(strategist.error as any).message || 'Server Error'}
								</div>
							)}

							{strategist.data && pipelinePhase !== 'strategizing' && (
								<div className="flex flex-col items-center rounded-lg border border-gray-700 bg-gray-900 p-6">
									<h3 className="mb-2 text-xs font-semibold tracking-widest text-gray-500 uppercase">Final Verdict</h3>
									<div
										className={`mb-4 text-5xl font-black ${strategist.data.recommendation === 'BUY' ? 'text-green-500' : strategist.data.recommendation === 'SELL' ? 'text-red-500' : 'text-yellow-500'}`}
									>
										{strategist.data.recommendation}
									</div>
									<div className="mb-6 rounded-full bg-gray-800 px-4 py-1 text-sm font-medium">
										Confidence: <span className="text-white">{strategist.data.confidence}%</span>
									</div>
									<div className="w-full max-w-2xl text-center">
										<p className="text-lg leading-relaxed text-gray-300 italic">"{strategist.data.explanation}"</p>
									</div>
									<div className="mt-6 flex flex-col items-center gap-2">
										<p className="text-xs tracking-wider text-gray-500 uppercase">Was this recommendation helpful?</p>
										<div className="flex gap-3">
											<button
												className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${feedbackGiven === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-50`}
												disabled={feedbackGiven !== null || submitFeedback.isPending}
												onClick={() => {
													setFeedbackGiven('positive');
													submitFeedback.mutate({
														symbol,
														recommendation: strategist.data!.recommendation,
														feedback: 'positive',
													});
												}}
											>
												👍 Helpful
											</button>
											<button
												className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${feedbackGiven === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-50`}
												disabled={feedbackGiven !== null || submitFeedback.isPending}
												onClick={() => {
													setFeedbackGiven('negative');
													submitFeedback.mutate({
														symbol,
														recommendation: strategist.data!.recommendation,
														feedback: 'negative',
													});
												}}
											>
												👎 Not helpful
											</button>
										</div>
										{feedbackGiven && <p className="text-xs text-gray-500">Thanks for your feedback!</p>}
									</div>
								</div>
							)}

							{!strategist.data && pipelinePhase !== 'strategizing' && !strategist.error && (
								<p className="text-sm text-gray-500 italic">Strategy will appear here after analysis completes.</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
