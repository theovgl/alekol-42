const AVLTree = require('avl');
const User = require('./User.js');

class UserTree extends AVLTree {
	constructor() {
		super();
	}

	async findWithDb(ft_login, supabase) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		let user_in_guilds;
		try {
			user_in_guilds = await supabase.fetchUser({ ft_login });
		} catch (error) {
			console.error(error);
			throw (`Could not fetch user ${ft_login}`);
		}
		user = new User(ft_login, user_in_guilds);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
