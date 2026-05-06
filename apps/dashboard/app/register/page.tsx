export default function RegisterPage() {
	return (
		<div className="flex bg-gray-900 text-white min-h-screen items-center justify-center">
			<div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md">
				<h2 className="text-2xl font-bold mb-6 text-center">Create CryptoSense Account</h2>
				<form className="flex flex-col gap-4">
					<input type="email" placeholder="Email" className="p-2 bg-gray-700 rounded" required />
					<input type="password" placeholder="Password" className="p-2 bg-gray-700 rounded" required />
					<input type="password" placeholder="Confirm Password" className="p-2 bg-gray-700 rounded" required />
					<button type="submit" className="p-2 bg-blue-600 rounded font-semibold hover:bg-blue-500">
						Register
					</button>
				</form>
				<p className="mt-4 text-center text-sm text-gray-400">
					Already have an account? <a href="/login" className="text-blue-400">Login</a>
				</p>
			</div>
		</div>
	);
}
