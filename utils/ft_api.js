const { ClientCredentials, AuthorizationCode } = require('simple-oauth2');
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
const clientCC = new ClientCredentials(apiConfig);
const clientAC = new AuthorizationCode(apiConfig);

async function getLatestLocation() {
	const { token } = await clientCC.getToken({
		scope: 'public',
	});
	const access_token = clientCC.createToken(token);
	return axios({
		method: 'get',
		url: 'https://api.intra.42.fr/v2/locations?per_page=1',
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`,
		},
	})
		.then((response) => {
			return (response.data[0]);
		});
}

async function getUsersMap() {
	const { token } = await clientCC.getToken({
		scope: 'public',
	});
	const access_token = clientCC.createToken(token);
	let url = 'https://api.intra.42.fr/v2/locations?filter%5Bactive%5D=true&per_page=100';
	let users_map = [];
	do {
		const response = await axios({
			method: 'get',
			url,
			headers: {
				'Authorization': `Bearer ${access_token.token.access_token}`,
			},
		})
			.catch(() => {
				if (response.status == 429) return new Promise(resolve => setTimeout(resolve, 500, null));
			});
		if (response == null) continue ;
		users_map = users_map.concat(response.data);
		url = /<([^>]+)>; rel="next"/.exec(response.headers['link']);
		if (!url) break ;
		url = url[1];
	} while (url);
	return users_map;
}

async function fetchUserLocationsByLogin(login) {
	const { token } = await clientCC.getToken({
		scope: 'public',
	});
	const access_token = clientCC.createToken(token);
	return axios({
		method: 'GET',
		url: `https://api.intra.42.fr/v2/users/${login}/locations`,
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`,
		},
	})
		.then((response) => {
			return (response.data);
		});
}

async function fetchMe(authorization_code) {
	const access_token = await clientAC.getToken({
		code: authorization_code,
		redirect_uri: process.env.REDIRECT_URI,
		scope: 'public',
	});
	return axios({
		method: 'GET',
		url: 'https://api.intra.42.fr/v2/me',
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`,
		},
	})
		.then((response) => {
			return (response.data);
		});
}

module.exports = { getLatestLocation, getUsersMap, fetchUserLocationsByLogin, fetchMe };
