const { ClientCredentials } = require('simple-oauth2');
const axios = require('axios');

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

function getUsersMap() {
	return axios({
		method: 'get',
		url: 'https://meta.intra.42.fr/clusters.json',
		headers: {
			'Cookie': `_intra_42_session_production=${process.env.FT_SESSION};`,
		},
	})
		.then((response) => {
			return (response.data);
		})
		.catch((error) => {
			console.error(error);
		});
}

async function fetchUserLocationsByLogin(login) {
	const { token } = await apiClient.getToken({
		scope: 'public',
	});
	const access_token = apiClient.createToken(token);
	return (axios({
		method: 'GET',
		url: `https://api.intra.42.fr/v2/users/${login}/locations`,
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`,
		},
	}));
}

module.exports = { getUsersMap, fetchUserLocationsByLogin };
