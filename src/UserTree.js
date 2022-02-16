const AVLTree = require('avl');
const User = require('./User.js');
const { logUserAction } = require('./logs.js');

class UserTree extends AVLTree {
	constructor(client_id) {
		super();
		this.client_id = client_id ?? 0;
	}

	async findWithDb(ft_login, supabase) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		logUserAction(console.log, ft_login, 'Creating the user in the binary tree');
		const user_in_guilds = await supabase.fetchUser({ ft_login, client_id: this.client_id });
		user = new User(ft_login, user_in_guilds);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
