'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMe, useLogout } from '@/api/routes/auth';

export default function DashboardPage() {
	const { data: user, isLoading, isError } = useMe();
	const logout = useLogout();
	const router = useRouter();

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
						<span className="rounded bg-indigo-900 px-3 py-1 text-xs font-semibold text-indigo-300">
							CRON Active
						</span>
					</div>
					<p className="text-gray-300">
						Data is being fetched real-time from Binance API in background (Every 5 minutes).
					</p>
				</div>
			</div>
		</div>
	);
}
