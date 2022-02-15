const AVLTree = require('avl');
const User = require('./User.js');

class UserTree extends AVLTree {
	constructor() {
		super();
	}

	async findWithDb(ft_login, supabase) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		console.log(`${ft_login} | Creating the user in the binary tree`);
		let user_in_guilds;
		try {
			user_in_guilds = await supabase.fetchUser({ ft_login });
		} catch (error) {
			console.error(error);
			throw (`${ft_login} | Could not fetch user in the database`);
		}
		user = new User(ft_login, user_in_guilds);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
