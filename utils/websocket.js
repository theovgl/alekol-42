const WebSocket = require('ws');
const { logAction, logUserAction } = require('../src/logs.js');
const users = require('../src/users.js');
const ws_healthcheck = require('../src/ws_healthcheck.js');

function initWebsocket() {
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
	ws.on('open', onOpen);
	ws.on('close', onClose);
	ws.on('message', onMessage);
	ws.on('error', onError);
	return ws;
}

function onOpen() {
	logAction(console.log, 'WebSocket connection established');
	this.send(JSON.stringify({
		command: 'subscribe',
		identifier: JSON.stringify({
			channel: 'LocationChannel',
			user_id: parseInt(process.env.FT_CABLE_USER_ID),
		}),
	}));
	this.send(JSON.stringify({
		command: 'subscribe',
		identifier: JSON.stringify({
			channel: 'NotificationChannel',
			user_id: parseInt(process.env.FT_CABLE_USER_ID),
		}),
	}));
	this.send(JSON.stringify({
		command: 'subscribe',
		identifier: JSON.stringify({
			channel: 'FlashChannel',
			user_id: parseInt(process.env.FT_CABLE_USER_ID),
		}),
	}));
}

function onClose(code, reason) {
	logAction(console.log, `Closing connection (code ${code}): REASON ${reason}`);
	initWebsocket();
}

async function onMessage(data) {
	// Parse the message
	try {
		data = JSON.parse(data);
	} catch (error) {
		logAction(console.error, 'Could not parse the JSON message from websocket');
		return;
	}

	// Parse the location (informations about the user's connection)
	if (!data?.identifier
		|| !data?.message
		|| JSON.parse(data.identifier).channel != 'LocationChannel') {
		if (data?.type !== 'ping') logAction(console.log, 'The message does not concern an update of an user\'s location');
		return;
	}
	const location = data.message.location;
	if (!location) {
		logAction(console.error, 'The location object is missing in the message');
		return;
	}
	if (!location.end_at) ws_healthcheck.latest_ws_id = location.id;
	// Get the user from the binary tree
	const ft_login = location.login;
	let user;
	logUserAction(console.log, ft_login, `Just logged ${location.end_at == null ? 'in' : 'out'}`);
	try {
		user = await users.findWithDb(ft_login);
		// Update the user's role
		if (user) {
			user.host = location.end_at == null ? location.host : null;
			user.begin_at = location.end_at == null ? location.begin_at : null;
			user.end_at = location.end_at;
			await user.updateRole();
		}
	} catch (error) {
		logAction(console.error, 'An error occured while updating the role');
		console.error(error);
		return;
	}
}

function onError(error) {
	logAction(console.error, 'An error occured with the websocket');
	console.error(error);
}

module.exports = { initWebsocket, onOpen, onClose, onMessage, onError };
