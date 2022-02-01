const axios = require('axios');
const createUserInTree = require('./createUserInTree.js');

function getUsersMap() {
	return axios({
		method: 'get',
		url: 'https://meta.intra.42.fr/clusters.json',
		headers: {
			'Cookie': `_intra_42_session_production=${process.env.FT_SESSION};`,
		},
	})
		.then((response) => {
			return (response.data);
		})
		.catch((error) => {
			console.error(error);
		});
}

// Promise.all() here
async function initUsersMap(client, users) {
	let users_map;
	try {
		users_map = await getUsersMap();
	} catch (error) {
		console.error(error);
	}
	for (const location of users_map) {
		try {
			let user;
			try {
				user = users.find(location.login)?.data
					?? await createUserInTree(users, location.login);
			} catch (error) {
				console.error(error);
				continue;
			}
			user.updateRole(client, { host: location.host, begin_at: location.begin_at });
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = initUsersMap;
