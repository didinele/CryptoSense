export default function RegisterPage() {
	return (
		<div className="flex bg-gray-900 text-white min-h-screen items-center justify-center">
			<div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md">
				<h2 className="text-2xl font-bold mb-6 text-center">Create CryptoSense Account</h2>
				<form className="flex flex-col gap-4">
					<input className="p-2 bg-gray-700 rounded" placeholder="Email" required type="email" />
					<input className="p-2 bg-gray-700 rounded" placeholder="Password" required type="password" />
					<input className="p-2 bg-gray-700 rounded" placeholder="Confirm Password" required type="password" />
					<button className="p-2 bg-blue-600 rounded font-semibold hover:bg-blue-500" type="submit">
						Register
					</button>
				</form>
				<p className="mt-4 text-center text-sm text-gray-400">
					Already have an account? <a className="text-blue-400" href="/login">Login</a>
				</p>
			</div>
		</div>
	);
}
