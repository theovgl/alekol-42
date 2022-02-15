const AVLTree = require('avl');
const User = require('./User.js');
const { logUserAction } = require('./logs.js');

class UserTree extends AVLTree {
	constructor() {
		super();
	}

	async findWithDb(ft_login, supabase) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		logUserAction(console.log, ft_login, 'Creating the user in the binary tree');
		const user_in_guilds = await supabase.fetchUser({ ft_login });
		user = new User(ft_login, user_in_guilds);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
