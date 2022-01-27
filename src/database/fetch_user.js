const axios = require('axios');
const apiClient = require('../../utils/ft_client.js');


async function fetchUser(login) {
	let access_token

	try {
		const { token } = await apiClient.getToken({
			scope: 'public'
		})
		access_token = apiClient.createToken(token)
	} catch (error) {
		console.error(error);
	}
	return(axios({
		method: 'GET',
		url: `https://api.intra.42.fr/v2/users/${login}`,
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`
		}
	}))
}

module.exports = fetchUser;
