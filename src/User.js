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

	async updateMemberRole(member, role_id) {
		const role = member.guild.roles.cache.get(role_id);
		if (!role) throw new Error(`Could not find the role (${role_id}) in the guild`);
		logUserAction(console.log, this.ft_login, `${this.isLogged ? 'Adding' : 'Removing'} the role (${role_id})`);
		if (this.isLogged) return member.roles.add(role);
		else return member.roles.remove(role);
	}

	async updateRole() {
		const requests = [];
		for (const member of this.guilds_member) {
			requests.push(supabase.fetchGuild(member.guild.id, member.client.application.id)
				.then(async (guild_data) => {
					if (!guild_data || guild_data.length == 0) {
						throw new Error(`The guild (${member.guild.id}) related to the client (${member.client.application.id}) is not registered in the database`);
					} else if (!guild_data[0].role) {
						throw new Error(`The guild (${member.guild.id}) related to the client (${member.client.application.id}) has not set a role`);
					}
					return this.updateMemberRole(member, guild_data[0].role)
						.catch((error) => {
							logAction(console.error, 'An error occured while updating the member role');
							console.error(error);
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
