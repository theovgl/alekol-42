const createUserInTree = require('../src/createUserInTree.js');

function onOpen(ws) {
	return (() => {
		console.log('WebSocket connection established!');
		ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":75939}"}');
		ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":75939}"}');
		ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":75939}"}');
	});
}

function onClose(code, reason) {
	console.log('Closing connection (code %d): REASON %s', code, reason);
}

function onMessage(client, users) {
	return (async (data) => {
		const message = JSON.parse(data);

		// To delete
		const wait = require('util').promisify(setTimeout);
		await wait(500);

		if (!message?.identifier
			|| !message?.message
			|| JSON.parse(message.identifier).channel != 'LocationChannel') {return;}
		const location = message.message.location;
		const ft_login = location.login;

		let user;
		try {
			user = users.find(ft_login)?.data
				?? await createUserInTree(users, ft_login);
		}
		catch (error) {
			console.error(error);
			return;
		}
		await user.updateRole(client, { host: location.host, begin_at: location.begin_at });
		console.log(`${user.ft_login} has been updated!`);
	});
}

function onError(error) {
	console.error(error);
}

module.exports = { onOpen, onClose, onMessage, onError };
