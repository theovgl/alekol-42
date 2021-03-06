const AVLTree = require('avl');
const User = require('./User.js');
const supabase = require('../utils/supabase.js');
const { logUserAction } = require('./logs.js');

function fetchMemberInAllGuilds(discord, user_in_guilds) {
	const requests = [];
	for (const user of user_in_guilds) {
		const guild = discord.guilds.cache.get(user.guild_id);
		if (!guild) continue ;
		requests.push(guild.members.fetch(user.discord_id));
	}
	return Promise.all(requests);
}

class UserTree extends AVLTree {
	constructor(discord) {
		super();
		this.discord = discord ?? null;
	}

	async findWithDb(ft_login) {
		let user = this.find(ft_login)?.data;
		if (user) return user;
		logUserAction(console.log, ft_login, 'Creating the user in the binary tree');
		const user_in_guilds = await supabase.fetchUser({ ft_login });
		const guilds_member = await fetchMemberInAllGuilds(this.discord, user_in_guilds);
		user = new User(ft_login, guilds_member);
		this.insert(ft_login, user);
		return (user);
	}
}

module.exports = UserTree;
