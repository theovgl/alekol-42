const supabase = require('../utils/supabase.js');

// Promise.all() here
async function initUsersMap(supabase, ft_api, client, users) {
	let users_map;
	try {
		users_map = await ft_api.getUsersMap();
	} catch (error) {
		console.error(error);
	}
	users_map.unshift({"host":"e2r4p23","begin_at":"2022-02-08T21:39:43.996+01:00","end_at":null,"login":"vfurmane","image":"vfurmane.jpg","campus_id":1});
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
