const { logAction, logUserAction } = require('./logs.js');

async function assignRole(memberRoles, to_add) {
	await memberRoles.add(to_add);
}

async function removeRole(memberRoles, to_remove) {
	await memberRoles.remove(to_remove);
}

module.exports = class User {
	constructor(ft_login, user_in_guilds) {
		this.ft_login = ft_login;
		this.guilds = user_in_guilds.map((guild) => {
			return ({
				id: guild.guild_id,
				discord_id: guild.discord_id,
			});
		});
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
		for (const user_guild of this.guilds) {
			const guild = client.guilds.cache.get(user_guild.id);
			if (!guild) continue;
			// ===== Should be saved in the User object =====
			try {
				user_guild.member = await guild.members.fetch(user_guild.discord_id);
			} catch (error) {
				logAction(console.error, 'An error occured while fetching the member');
				console.error(error);
				continue;
			}
			// =====  =====
			if (!user_guild.member) continue;
			requests.push(supabase.fetchGuild(user_guild.id, client.application.id)
				.then((guild_data) => {
					if (!guild_data
						|| guild_data.length == 0) return;
					return this.updateMemberRole(user_guild.member, guild_data[0].role);
				})
				.catch((error) => {
					logAction(console.error, 'An error occured while fetching the guild\'s data');
					console.error(error);
				}));
		}
		return Promise.all(requests);
	}
};
