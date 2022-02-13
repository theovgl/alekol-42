// Promise.all() here
async function initUsersMap(supabase, ft_api, client, users) {
	let users_map;
	try {
		users_map = await ft_api.getUsersMap();
	} catch (error) {
		console.error(error);
	}
	for (const location of users_map) {
		try {
			let user;
			try {
				user = users.find(location.login)?.data
					?? await users.insertFromDb(supabase, location.login);
			} catch (error) {
				console.error(error);
				continue;
			}
			user.host = location.host;
			user.begin_at = location.begin_at;
			user.updateRole(supabase, client);
			console.log(`${user.ft_login} location has been updated!`);
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = initUsersMap;
