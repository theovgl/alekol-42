const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();
// client -> discord
const client = require('./client.js');
const supabase = require('./utils/supabase.js');
const ft_api = require('./utils/ft_api.js');
const { onOpen, onClose, onMessage, onError } = require('./utils/websocket.js');
const users = require('./src/users.js');
require('./deploy-commands.js');
const initApp = require('./app.js');
const app = initApp(supabase, ft_api, client, users);

require('./src/initUsersMap.js')(ft_api, client, users);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`HTTP server listening on port ${PORT}`);
});
