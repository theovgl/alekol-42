const fetchUser = require('../src/database/fetchUser.js');
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
		const ft_login = message.message.location.login;

		let user_in_guilds;
		try {
			user_in_guilds = await fetchUser({ ft_login });
		}
		catch (error) {
			console.error(`Could not fetch user (${ft_login})\n${error}`);
			return;
		}
		if (user_in_guilds.length == 0) {
			console.error(`User (${ft_login}) is not registered in the database`);
			return;
		}

		const user = users.find(ft_login)?.data
			?? createUserInTree(users, user_in_guilds);
		await user.updateRole(client, (message.message.location.end_at == null));
		console.log(`${user.ft_login} has been updated!`);
	});
}

function onError(error) {
	console.error(error);
}

module.exports = { onOpen, onClose, onMessage, onError };
