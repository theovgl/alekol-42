const supabase = require('../utils/supabase.js');
const { logAction } = require('./logs.js');

async function resetRoleInGuild(guild, role_id) {
	await guild.members.fetch();
	const role_manager = guild.roles.cache.get(role_id);
	if (!role_manager) throw new Error(`The role (${role_id}) has not been found in guild '${guild.name}' (${guild.id})`);
	const requests = [];
	for (const member of role_manager.members.values()) {
		requests.push(member.roles.remove(role_manager));
	}
	await Promise.all(requests);
}

async function resetRoles(discord) {
	const requests = [];
	for (const guild of discord.guilds.cache.values()) {
		requests.push(supabase.fetchGuild(guild.id)
			.then((guild_data) => {
				if (!guild_data[0].role) throw new Error(`The role has not been set in guild '${guild.name}' (${guild.id})`);
				return resetRoleInGuild(guild, guild_data[0].role);
			})
			.catch((error) => {
				logAction(console.error, 'An error occured while resetting role');
				console.error(error);
				return null;
			}),
		);
	}
	return Promise.all(requests);
}

module.exports = resetRoles;
