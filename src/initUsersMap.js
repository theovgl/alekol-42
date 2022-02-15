const { logAction, logUserAction } = require('./logs.js');

async function initUsersMap(supabase, ft_api, client, users) {
	let users_map;
	try {
		users_map = await ft_api.getUsersMap();
	} catch (error) {
		logAction(console.error, 'An error occured while fetching the users\' map');
		console.error(error);
	}
	const requests = [];
	for (const location of users_map) {
		logUserAction(console.log, location.login, 'Is at school');
		requests.push(users.findWithDb(location.login, supabase)
			.then(async (user) => {
				user.host = location.host;
				user.begin_at = location.begin_at;
				await user.updateRole(supabase, client);
			})
			.catch((error) => {
				logAction(console.error, 'An error occured while getting the user from the binary tree');
				console.error(error);
			}),
		);
	}
	await Promise.all(requests);
}

module.exports = initUsersMap;
