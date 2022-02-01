const supabase = require('../utils/supabase.js');
const User = require('./User.js');

async function createUserInTree(users, ft_login) {
	let user_in_guilds;
	try {
		user_in_guilds = await supabase.fetchUser({ ft_login });
	} catch (error) {
		console.error(error);
		throw (`Could not fetch user (${ft_login})`);
	}
	if (user_in_guilds.length == 0) throw (`User (${ft_login}) is not registered in the database`);

	const user = new User(user_in_guilds[0].ft_id,
		user_in_guilds[0].ft_login,
		user_in_guilds);
	users.insert(user_in_guilds[0].ft_login, user);
	return (user);
}

module.exports = createUserInTree;
