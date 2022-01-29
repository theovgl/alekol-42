const User = require('./User.js');

module.exports = function createUserInTree(users, user_in_guilds) {
	const user = new User(user_in_guilds[0].ft_id,
		user_in_guilds[0].ft_login,
		user_in_guilds);
	users.insert(user_in_guilds[0].ft_login, user);
	return (user);
};
