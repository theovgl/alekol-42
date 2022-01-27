const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
const client = require('./client.js');

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

ws.on('message', function message(data) {
	const message = JSON.parse(data);
	if (message?.identifier?.channel != 'LocationChannel')
		return;
	console.log(message);
	// message.message.location.user_id; -> comparer avec la base de donnée
	// ajouter le rôle @alekol si dedans
	// message.message.location.end_at == null si connection
});

ws.on('error', function message(data) {
	console.log(error);
});
