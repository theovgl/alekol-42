const fetchUser = require('./database/fetchUser.js');
const User = require('./User.js');

module.exports = async function createUserInTree(users, ft_login) {
	let user_in_guilds;
	try {
		user_in_guilds = await fetchUser({ ft_login });
	} catch (error) {
		throw (`Could not fetch user (${ft_login})\n${error}`);
	}
	if (user_in_guilds.length == 0) throw (`User (${ft_login}) is not registered in the database`);

	const user = new User(user_in_guilds[0].ft_id,
		user_in_guilds[0].ft_login,
		user_in_guilds);
	users.insert(user_in_guilds[0].ft_login, user);
	return (user);
};
