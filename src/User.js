const { logAction, logUserAction } = require('./logs.js');

async function assignRole(memberRoles, to_add) {
	await memberRoles.add(to_add);
}

async function removeRole(memberRoles, to_remove) {
	await memberRoles.remove(to_remove);
}

module.exports = class User {
	constructor(ft_login, guilds_member) {
		this.ft_login = ft_login;
		this.guilds_member = guilds_member;
		this.host = null;
		this.begin_at = null;
	}

	get isLogged() {
		return (!!this.host && !!this.begin_at);
	}

	async updateMemberRole(member, role_name) {
		const role = member.guild.roles.cache.find((r) => r.name === role_name);
		if (!role) {
			logAction(console.error, `Could not find the role '${role_name}' in the guild`);
			return;
		}
		logUserAction(console.log, this.ft_login, `${this.isLogged ? 'Adding' : 'Removing'} the role '${role_name}'`);
		if (this.isLogged) await assignRole(member.roles, role);
		else await removeRole(member.roles, role);
	}

	async updateRole(supabase, client) {
		const requests = [];
		for (const member of this.guilds_member) {
			requests.push(supabase.fetchGuild(member.guild.id, client.application.id)
				.then((guild_data) => {
					if (!guild_data
						|| guild_data.length == 0) return;
					return this.updateMemberRole(member, guild_data[0].role);
				})
				.catch((error) => {
					logAction(console.error, 'An error occured while fetching the guild\'s data');
					console.error(error);
				}));
		}
		return Promise.all(requests);
	}
};
