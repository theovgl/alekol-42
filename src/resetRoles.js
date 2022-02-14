async function resetRoles(supabase, discord) {
	for (const guild of discord.guilds.cache.values()) {
		const guild_data = await supabase.fetchGuild(guild.id, discord.application.id);
		await guild.members.fetch();
		const role_manager = guild.roles.cache.find((role) => role.name == guild_data[0].role);
		if (!role_manager) {
			console.error(`The role ${guild_data[0].role} has not been found in guild ${guild.name}`);
			return;
		}
		for (const member of role_manager.members.values()) {
			member.roles.remove(role_manager);
		}
	}
}

module.exports = resetRoles;
