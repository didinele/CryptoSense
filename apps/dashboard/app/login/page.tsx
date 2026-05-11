'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLogin } from '@/api/routes/auth';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	const login = useLogin({
		onSuccess: () => {
			router.push('/dashboard');
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		try {
			await login.mutateAsync({ username, password });
		} catch (err: any) {
			setError(err.message || 'Login failed');
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
			<div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-md">
				<h2 className="mb-6 text-center text-2xl font-bold">Login to CryptoSense</h2>
				{error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<input
						className="rounded bg-gray-700 p-2"
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Username"
						required
						type="text"
						value={username}
					/>
					<input
						className="rounded bg-gray-700 p-2"
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						required
						type="password"
						value={password}
					/>
					<button
						className="rounded bg-blue-600 p-2 font-semibold hover:bg-blue-500 disabled:opacity-50"
						disabled={login.isPending}
						type="submit"
					>
						{login.isPending ? 'Logging in...' : 'Login'}
					</button>
				</form>
				<p className="mt-4 text-center text-sm text-gray-400">
					Don't have an account?{' '}
					<a className="text-blue-400 hover:underline" href="/register">
						Register
					</a>
				</p>
			</div>
		</div>
	);
}
