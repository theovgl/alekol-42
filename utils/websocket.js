const WebSocket = require('ws');

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
	ws.on('message', onMessage(client, supabase, users));
	ws.on('error', onError);
	return ws;
}

function onOpen(ws) {
	return (() => {
		console.log('WebSocket connection established!');
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
	});
}

function onClose(ws, client, supabase, users) {
	return ((code, reason) => {
		console.log('Closing connection (code %d): REASON %s', code, reason);
		ws = initWebsocket(client, supabase, users);
	});
}

function onMessage(client, supabase, users) {
	return (async (data) => {
		// Parse the message
		let message;
		try {
			message = JSON.parse(data);
		} catch (error) {
			console.error('Could not parse the JSON message from websocket');
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
			console.error('The location object is missing in the message');
			return false;
		}
		// Get the user from the binary tree
		const ft_login = location.login;
		let user;
		try {
			user = users.find(ft_login)?.data
				?? await users.insertFromDb(supabase, ft_login);
		} catch (error) {
			console.error(error);
			return false;
		}
		// Update the user's role according to its location
		let new_location = null;
		if (!location.end_at) new_location = { host: location.host, begin_at: location.begin_at };
		await user.updateRole(supabase, client, new_location);
		console.log(`${user.ft_login} location has been updated!`);
		return true;
	});
}

function onError(error) {
	console.error(error);
}

module.exports = initWebsocket;
