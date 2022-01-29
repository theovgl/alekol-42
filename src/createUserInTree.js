const User = require('./User.js');

module.exports = function createUserInTree(users, ft_id, ft_login, user_in_guilds) {
	const user = new User(ft_id, ft_login, user_in_guilds);
	users.insert(ft_login, user);
	return (user);
};
