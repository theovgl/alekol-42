const AVLTree = require('avl');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const client = require('./client.js');
const { onOpen, onClose, onMessage, onError } = require('./utils/websocket.js');

dotenv.config();

const users = new AVLTree();

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
