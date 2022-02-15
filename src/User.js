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

	async updateRole(supabase, client) {
		for (const user_guild of this.guilds) {
			const guild = client.guilds.cache.get(user_guild.id);
			if (guild === undefined) continue;
			console.log(`${this.ft_login} | Updating in guild ${guild.name}`);

			let member;
			try {
				member = await guild.members.fetch(user_guild.discord_id);
			} catch (error) {
				console.error(error);
				continue;
			}

			let role;
			try {
				const guild_data = await supabase.fetchGuild(user_guild.id, client.application.id);
				if (guild_data.length == 0) throw `Did not find guild (${user_guild.id}) for user ${this.ft_login}`;
				role = guild_data[0].role;
			} catch (error) {
				console.error(error);
				continue;
			}
			// If we create the role, it can be too fast to check if
			// it already exists so the role will be created too many times
			const memberRoles = member.roles;
			const newRole = guild.roles.cache.find((r) => r.name === role);
			if (!newRole) {
				console.error(`${this.ft_login} | Could not find the role ${role} in the guild ${user_guild.id}`);
				continue;
			}

			console.log(`${this.ft_login} | ${this.isLogged ? "Adding" : "Removing"} the role ${role}`);
			try {
				if (this.isLogged) await assignRole(memberRoles, newRole);
				else await removeRole(memberRoles, newRole);
			} catch (error) {
				console.error(error);
				let message = `I tried to change the role \`${role}\` but I could not...\n`;
				if (error.code == 50013) message += 'I guess you should contact the serveur admin, and tell them that they must give higher permissions to the bot (me) than the role I want to give to people.';
				else message += 'I don\'t even know what is the problem, just contact the developpers please.';
				await member.send(message);
				continue;
			}
		}
	}
};
