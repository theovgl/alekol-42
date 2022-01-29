const AVLTree = require('avl');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const client = require('./client.js');
const { onOpen, onClose, onMessage, onError } = require('./utils/websocket.js');
const getUserByFtLogin = require('./src/getUserByFtLogin.js');

dotenv.config();

const users = new AVLTree();

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
	}
	catch (error) {
		console.error(error);
	}
	for (const location of users_map) {
		try {
			const user = await getUserByFtLogin(users, location.login);
			user.updateRole(client, true);
		}
		catch (error) {
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
