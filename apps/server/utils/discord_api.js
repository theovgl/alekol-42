const axios = require('axios');
const qs = require('qs');

const tokenHost = 'https://discord.com/api/v8';

async function getAccessToken(code) {
	return axios({
		method: 'POST',
		url: `${tokenHost}/oauth2/token`,
		data: qs.stringify({
			client_id: process.env.DISCORD_CLIENT_ID,
			client_secret: process.env.DISCORD_CLIENT_SECRET,
			redirect_uri: `${process.env.REDIRECT_URI}/register`,
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
