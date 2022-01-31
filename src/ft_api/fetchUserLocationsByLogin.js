const axios = require('axios');
const apiClient = require('../../utils/ft_client.js');

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

module.exports = { fetchUserLocationsByLogin };
