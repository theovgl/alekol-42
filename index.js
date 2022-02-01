const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
// client -> discord
const client = require('./client.js');
const { onOpen, onClose, onMessage, onError } = require('./utils/websocket.js');
const users = require('./src/users.js');
require('./deploy-commands.js');
require('./src/initUsersMap.js')(client, users);

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
