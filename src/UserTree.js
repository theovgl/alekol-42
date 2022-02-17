const AVLTree = require('avl');
const User = require('./User.js');
const { logUserAction } = require('./logs.js');

function fetchMemberInAllGuilds(discord, user_in_guilds) {
	const requests = [];
	for (const user of user_in_guilds) {
		requests.push(discord.guilds.cache.get(user.guild_id)
				.members.fetch(user.discord_id));
	}
	return (requests);
}

class UserTree extends AVLTree {
	constructor(discord) {
		super();
		this.discord = discord ?? null;
	}

	async findWithDb(ft_login, supabase) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		logUserAction(console.log, ft_login, 'Creating the user in the binary tree');
		const user_in_guilds = await supabase.fetchUser({ ft_login, client_id: this.discord.application.id });
		const guilds_member = await Promise.all(fetchMemberInAllGuilds(this.discord, user_in_guilds));
		user = new User(ft_login, guilds_member);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
