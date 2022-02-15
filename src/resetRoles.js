const { logAction } = require('./logs.js');

async function resetRoles(supabase, discord) {
	const requests = [];
	for (const guild of discord.guilds.cache.values()) {
		requests.push(supabase.fetchGuild(guild.id, discord.application.id)
			.then(async (guild_data) => {
				await guild.members.fetch();
				const role_manager = guild.roles.cache.find((role) => role.name == guild_data[0].role);
				if (!role_manager) {
					logAction(console.error, `The role ${guild_data[0].role} has not been found in guild ${guild.name}`);
					return;
				}
				const roles_requests = [];
				for (const member of role_manager.members.values()) {
					roles_requests.push(member.roles.remove(role_manager));
				}
				await Promise.all(roles_requests);
			})
			.catch((error) => {
				logAction(console.error, 'An error occured while fetching the guild from the database');
				console.error(error);
			})
		);
	}
	await Promise.all(requests);
}

module.exports = resetRoles;
