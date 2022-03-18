const supabase = require('../utils/supabase.js');
const { logAction, logUserAction } = require('./logs.js');

module.exports = class User {
	constructor(ft_login, guilds_member) {
		this.ft_login = ft_login;
		this.guilds_member = guilds_member;
		this.host = null;
		this.begin_at = null;
		this.end_at = null;
	}

	get isLogged() {
		return (!!this.host && !!this.begin_at);
	}

	updateMemberRole(member, role_name) {
		const role = member.guild.roles.cache.find((r) => r.name === role_name);
		if (!role) return Promise.reject(new Error(`Could not find the role '${role_name}' in the guild`));
		logUserAction(console.log, this.ft_login, `${this.isLogged ? 'Adding' : 'Removing'} the role '${role_name}'`);
		if (this.isLogged) return member.roles.add(role);
		else return member.roles.remove(role);
	}

	updateRole() {
		const requests = [];
		for (const member of this.guilds_member) {
			requests.push(supabase.fetchGuild(member.guild.id, member.client.application.id)
				.then((guild_data) => {
					if (!guild_data || guild_data.length == 0) return null;
					return this.updateMemberRole(member, guild_data[0].role)
						.catch((error) => {
							logAction(console.error, error.message);
							return null;
						});
				})
				.catch((error) => {
					logAction(console.error, 'An error occured while fetching the guild\'s data');
					console.error(error);
					return null;
				}));
		}
		return Promise.all(requests);
	}
};
