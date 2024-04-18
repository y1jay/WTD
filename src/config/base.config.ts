export const baseConfig = {
	host: '',
	jwt: {
		secret: 'wtd',
		expiresIn: {
			accessToken: '1s',
			refreshToken: '2h',
		},
	},
	cookieAge: 24 * 60 * 60 * 1000,
};

