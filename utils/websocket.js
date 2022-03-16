const WebSocket = require('ws');
const { logAction, logUserAction } = require('../src/logs.js');

function initWebsocket(client, supabase, users) {
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
	ws.on('close', onClose(ws, client, supabase, users));
	ws.on('message', onMessage(supabase, users));
	ws.on('error', onError);
	return ws;
}

function onOpen(ws) {
	return (() => {
		logAction(console.log, 'WebSocket connection established');
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
	});
}

function onClose(ws, client, supabase, users) {
	return ((code, reason) => {
		logAction(console.log, `Closing connection (code ${code}): REASON ${reason}`);
		ws = initWebsocket(client, supabase, users);
	});
}

function onMessage(supabase, users) {
	return (async (data) => {
		// Parse the message
		let message;
		try {
			message = JSON.parse(data);
		} catch (error) {
			logAction(console.error, 'Could not parse the JSON message from websocket');
			return false;
		}

		// To delete
		const wait = require('util').promisify(setTimeout);
		await wait(500);

		// Parse the location (informations about the user's connection)
		if (!message?.identifier
			|| !message?.message
			|| JSON.parse(message.identifier).channel != 'LocationChannel') {return false;}
		const location = message.message.location;
		if (!location) {
			logAction(console.error, 'The location object is missing in the message');
			return false;
		}
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
				await user.updateRole();
			}
		} catch (error) {
			logAction(console.error, 'An error occured while updating the role');
			console.error(error);
			return false;
		}
		return true;
	});
}

function onError(error) {
	logAction(console.error, 'An error occured with the websocket');
	console.error(error);
}

module.exports = { initWebsocket, onOpen, onClose, onMessage, onError };
