const { ClientCredentials } = require('simple-oauth2');

const apiConfig = {
	client: {
		id: process.env.UID_42,
		secret: process.env.SECRET_42,
	},
	auth: {
		tokenHost: 'https://api.intra.42.fr',
		tokenPath: '/oauth/token',
		authorizePath: '/oauth/authorize',
	},
};

const apiClient = new ClientCredentials(apiConfig);

module.exports = apiClient;
