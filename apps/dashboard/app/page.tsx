'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMe } from '@/api/routes/auth';

export default function Home() {
	const { data: user, isError, isFetching } = useMe();
	const router = useRouter();

	useEffect(() => {
		if (isFetching) return;
		router.replace(user ? '/dashboard' : '/login');
	}, [user, isError, isFetching, router]);

	return null;
}
