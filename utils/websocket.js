function onOpen(ws) {
	return (() => {
		console.log('WebSocket connection established!');
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
		ws.send(`{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":${process.env.FT_CABLE_USER_ID}}"}`);
	});
}

function onClose(code, reason) {
	console.log('Closing connection (code %d): REASON %s', code, reason);
}

function onMessage(client, supabase, users) {
	return (async (data) => {
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

		if (!message?.identifier
			|| !message?.message
			|| JSON.parse(message.identifier).channel != 'LocationChannel') {return false;}
		const location = message.message.location;
		if (!location) {
			console.error('The location object is missing in the message');
			return false;
		}
		const ft_login = location.login;
		let user;
		try {
			user = users.find(ft_login)?.data
				?? await users.insertFromDb(supabase, ft_login);
		} catch (error) {
			console.error(error);
			return false;
		}
		let new_location = null;
		if (!location.end_at) new_location = { host: location.host, begin_at: location.begin_at };
		await user.updateRole(client, new_location);
		console.log(`${user.ft_login} location has been updated!`);
		return true;
	});
}

function onError(error) {
	console.error(error);
}

module.exports = { onOpen, onClose, onMessage, onError };
