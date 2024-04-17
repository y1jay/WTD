export const baseConfig = {
	host: 'https://indonesia.store5000.com',
	jwt: {
		secret: 'wtd',
		expiresIn: {
			accessToken: '1s',
			refreshToken: '2h',
		},
	},
	cookieAge: 24 * 60 * 60 * 1000,
};

