'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useRegister } from '@/api/routes/auth';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	const register = useRegister({
		onSuccess: () => {
			router.push('/dashboard');
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		try {
			await register.mutateAsync({ email, password });
		} catch (err: any) {
			setError(err.message || 'Registration failed');
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
			<div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-md">
				<h2 className="mb-6 text-center text-2xl font-bold">Create CryptoSense Account</h2>
				{error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<input
						className="rounded bg-gray-700 p-2"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						required
						type="email"
						value={email}
					/>
					<input
						className="rounded bg-gray-700 p-2"
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						required
						type="password"
						value={password}
					/>
					<input
						className="rounded bg-gray-700 p-2"
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm Password"
						required
						type="password"
						value={confirmPassword}
					/>
					<button
						className="rounded bg-blue-600 p-2 font-semibold hover:bg-blue-500 disabled:opacity-50"
						disabled={register.isPending}
						type="submit"
					>
						{register.isPending ? 'Registering...' : 'Register'}
					</button>
				</form>
				<p className="mt-4 text-center text-sm text-gray-400">
					Already have an account?{' '}
					<a className="text-blue-400 hover:underline" href="/login">
						Login
					</a>
				</p>
			</div>
		</div>
	);
}
