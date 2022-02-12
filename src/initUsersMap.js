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
			user.updateRole(supabase, client, { host: location.host, begin_at: location.begin_at });
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = initUsersMap;
