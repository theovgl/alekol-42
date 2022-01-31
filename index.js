const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
const client = require('./client.js');
const { onOpen, onClose, onMessage, onError } = require('./utils/websocket.js');
const users = require('./src/users.js');
const createUserInTree = require('./src/createUserInTree.js');

const axios = require('axios');

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

(async () => {
	let users_map;
	try {
		users_map = await getUsersMap();
	} catch (error) {
		console.error(error);
	}
	for (const location of users_map) {
		try {
			let user;
			try {
				user = users.find(location.login)?.data
					?? await createUserInTree(users, location.login);
			} catch (error) {
				console.error(error);
				continue;
			}
			user.updateRole(client, { host: location.host, begin_at: location.begin_at });
		} catch (error) {
			console.error(error);
		}
	}
})();

const websocket_config = {
	protocolVersion: 13,
	perMessageDeflate: true,
	headers: {
		Origin: 'https://meta.intra.42.fr',
		Cookie: `user.id=${process.env.FT_USER_ID};`,
	},
};
const ws = new WebSocket('wss://profile.intra.42.fr/cable',
	['actioncable-v1-json', 'actioncable-unsupported'],
	websocket_config);
ws.on('open', onOpen(ws));
ws.on('close', onClose);
ws.on('message', onMessage(client, users));
ws.on('error', onError);
