const ROLE = 'alekol-user';

async function assignRole(memberRoles, to_add) {
	await memberRoles.add(to_add);
}

async function removeRole(memberRoles, to_remove) {
	await memberRoles.remove(to_remove);
}

module.exports = class User {
	constructor(ft_id, ft_login, user_in_guilds) {
		this.ft_id = ft_id;
		this.ft_login = ft_login;
		this.guilds = user_in_guilds.map((guild) => {
			return ({
				id: guild.guild_id,
				discord_id: guild.discord_id,
			});
		});
	}

	async updateRole(client, is_at_school) {
		for (const user_guild of this.guilds) {
			const guild = client.guilds.cache.get(user_guild.id);
			if (guild === undefined) continue;

			let member;
			try {
				member = await guild.members.fetch(user_guild.discord_id);
			}
			catch (error) {
				console.error(error);
				continue;
			}

			// If we create the role, it can be too fast to check if
			// it already exists so the role will be created too many times
			const memberRoles = member.roles;
			let newRole;
			try {
				newRole = guild.roles.cache.find((r) => r.name === ROLE);
			}
			catch (error) {
				console.error(error);
				continue;
			}
			if (!newRole) {
				console.error(`Could not find the role (${ROLE}) in the guild (${user_guild.id})`);
				continue;
			}

			try {
				if (is_at_school) assignRole(memberRoles, newRole);
				else if (!is_at_school) removeRole(memberRoles, newRole);
			}
			catch (error) {
				console.error(error);
				continue;
			}
		}
	}
};
