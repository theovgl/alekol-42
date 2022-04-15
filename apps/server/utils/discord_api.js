const axios = require('axios');
const qs = require('qs');
const config = require('../config.js');

const tokenHost = 'https://discord.com/api/v8';

async function getAccessToken(code) {
	return axios({
		method: 'POST',
		url: `${tokenHost}/oauth2/token`,
		data: qs.stringify({
			client_id: config.discord.client.id,
			client_secret: config.discord.client.secret,
			redirect_uri: `${config.redirect_uri}/register`,
			code,
			grant_type: 'authorization_code',
		}),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	})
		.then((response) => {
			return (response.data);
		});
}

async function fetchMe(code) {
	const token = await getAccessToken(code);
	return axios({
		method: 'GET',
		url: 'https://discord.com/api/users/@me',
		headers: {
			'Authorization': `${token.token_type} ${token.access_token}`,
		},
	})
		.then((response) => {
			return (response.data);
		});
}

module.exports = { fetchMe };
