const ft_api = require('../utils/ft_api.js');
const users = require('./users.js');
const { logUserAction } = require('./logs.js');

async function initUsersMap() {
	const users_map = await ft_api.getUsersMap();
	const requests = [];
	for (const location of users_map) {
		logUserAction(console.log, location.user.login, 'Is at school');
		requests.push(users.findWithDb(location.user.login)
			.then(async (user) => {
				user.host = location.host;
				user.begin_at = location.begin_at;
				await user.updateRole();
			}),
		);
	}
	await Promise.all(requests);
}

module.exports = initUsersMap;
