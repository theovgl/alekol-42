const fetchUser = require('../src/database/fetchUser.js');
const createUserInTree = require('../src/createUserInTree.js');

module.exports = async function getUserByFtLogin(users, ft_login) {
	let user_in_guilds;
	try {
		user_in_guilds = await fetchUser({ ft_login });
	}
	catch (error) {
		throw (`Could not fetch user (${ft_login})\n${error}`);
	}
	if (user_in_guilds.length == 0) throw (`User (${ft_login}) is not registered in the database`);

	return (users.find(ft_login)?.data
		?? createUserInTree(users, user_in_guilds));
};
