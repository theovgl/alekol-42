const dotenv = require('dotenv');
dotenv.config();
// client -> discord
const client = require('./client.js');
const supabase = require('./utils/supabase.js');
const ft_api = require('./utils/ft_api.js');
const { initWebsocket } = require('./utils/websocket.js');
const users = require('./src/users.js');
const initApp = require('./app.js');

require('./deploy-commands.js');
require('./src/initUsersMap.js')(supabase, ft_api, client, users);
require('./src/resetRoles.js')(supabase, client);

// Create the websocket connection
initWebsocket(client, supabase, users);

// Create the HTTP application
const app = initApp(supabase, ft_api, client, users);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`HTTP server listening on port ${PORT}`);
});
