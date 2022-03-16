const supabase = require('../utils/supabase.js');
const { logAction } = require('./logs.js');

async function resetRoleInGuild(guild, role_name) {
	await guild.members.fetch();
	const role_manager = guild.roles.cache.find((role) => role.name == role_name);
	if (!role_manager) {
		logAction(console.error, `The role ${role_name} has not been found in guild ${guild.name}`);
		return;
	}
	const requests = [];
	for (const member of role_manager.members.values()) {
		requests.push(member.roles.remove(role_manager));
	}
	await Promise.all(requests);
}

async function resetRoles(discord) {
	const requests = [];
	for (const guild of discord.guilds.cache.values()) {
		requests.push(supabase.fetchGuild(guild.id, discord.application.id)
			.then((guild_data) => resetRoleInGuild(guild, guild_data[0].role),
			));
	}
	await Promise.all(requests);
}

module.exports = resetRoles;
