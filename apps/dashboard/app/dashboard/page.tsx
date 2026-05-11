'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMe, useLogout } from '@/api/routes/auth';
import { useAnalyzeSymbol, type AnalysisData } from '@/api/routes/analysis';

export default function DashboardPage() {
	const { data: user, isLoading, isError } = useMe();
	const logout = useLogout();
	const router = useRouter();

	const [symbol, setSymbol] = useState('BTCUSDT');
	const {
		data: rawAnalysis,
		isLoading: isAnalyzing,
		error: analyzeError,
		refetch: runAnalysis,
	} = useAnalyzeSymbol(symbol, { enabled: false });
	const analysis = rawAnalysis as AnalysisData | undefined;

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
			</div>
		</div>
	);
}
