export const queryKeys = {
	all: ['api'] as const,
	auth: {
		all: ['api', 'auth'] as const,
		me: ['api', 'auth', 'me'] as const,
	},
} as const;
