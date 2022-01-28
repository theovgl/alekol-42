const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
const client = require('./client.js');
const compareOnLog = require('./src/compareOnLog.js');
const updateRole = require('./src/updateRole.js');

const ws = new WebSocket('wss://profile.intra.42.fr/cable', ['actioncable-v1-json', 'actioncable-unsupported'], {
	'protocolVersion': 13,
	'perMessageDeflate': true,
	'headers': {
		'Origin': 'https://meta.intra.42.fr',
		'Cookie': `user.id=${process.env.FT_USER_ID};`,
	},
});

ws.on('open', function open() {
	console.log('WebSocket connection established!');
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":75939}"}');
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":75939}"}');
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":75939}"}');
});

ws.on('close', (code, reason) => {
	console.log('Closing connection (code %d): REASON %s', code, reason);
});

ws.on('message', async (data) => {
	const message = JSON.parse(data);

	if (!message?.identifier
		|| !message?.message
		|| JSON.parse(message.identifier).channel != 'LocationChannel') {return;}

	let response;
	try {
		response = await compareOnLog(message.message.location.user_id);
	} catch (error) {
		console.error(`${error}\nCould not fetch user ${message.message.location.user_id}`);
		return;
	}
	if (!response) {
		console.error(`${message.message.location.user_id} is not registered`);
		return;
	}

	try {
		await updateRole(client, response.discord_id, response.guild_id, (message.message.location.end_at == null));
	} catch (error) {
		console.error(error);
		return;
	}
});

ws.on('error', (error) => {
	console.error(error);
});
