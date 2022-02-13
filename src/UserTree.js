const AVLTree = require('avl');
const User = require('./User.js');

class UserTree extends AVLTree {
	constructor() {
		super();
	}

	async insertFromDb(supabase, ft_login) {
		let user_in_guilds;
		try {
			user_in_guilds = await supabase.fetchUser({ ft_login });
		} catch (error) {
			console.error(error);
			throw (`Could not fetch user ${ft_login}`);
		}
		const user = new User(ft_login, user_in_guilds);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
