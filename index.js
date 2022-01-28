const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
const client = require('./client.js');
const compareOnLog = require('./src/compareOnLog.js')
const mock = require('./mock.js');
const updateRole = require('./src/updateRole.js');

const ws = new WebSocket('wss://profile.intra.42.fr/cable', ["actioncable-v1-json", "actioncable-unsupported"], {
	"protocolVersion": 13,
	"perMessageDeflate": true,
	"headers": {
		"Origin": "https://meta.intra.42.fr",
		"Cookie": `user.id=${process.env.FT_USER_ID};`
	}
});

ws.on('open', function open() {
	console.log("WebSocket connection established!");
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":75939}"}');
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationChannel\\",\\"user_id\\":75939}"}');
	ws.send('{"command":"subscribe","identifier":"{\\"channel\\":\\"FlashChannel\\",\\"user_id\\":75939}"}');
});

ws.on('close', function message(code, reason) {
	console.log('Closing connection (code %d): REASON %s', code, reason);
});

//attention parce que ici j'utilise plus le web socket mais le mock
ws.on('message', async function message(data) {
	// const message = JSON.parse(data);
	const message = mock;

	if (message?.identifier?.channel != 'LocationChannel')
		return;

	let response;
	try {
		response = await compareOnLog(message.message.location.user_id)
	} catch (error) {
		console.error(`${error}\nCould not fetch user ${message.message.location.user_id}`);
		return;
	}
	if (!response) {
		console.error(`${message.message.location.user_id} is not registered`);
		return;
	}

	try {
		if (message.message.location.end_at == null) {
			await updateRole(response.discord_id, response.guild_id, true)
		} else {
			await updateRole(response.discord_id, response.guild_id, false)
		}
	} catch (error) {
		console.error(error);
		return;
	}
	// message.message.location.user_id; -> comparer avec la base de donnée
	// ajouter le rôle @alekol si dedans
	// message.message.location.end_at == null si connection
});

ws.on('error', function message(data) {
	console.log(error);
});
