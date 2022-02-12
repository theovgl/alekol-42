async function waitForDiscordClient(client) {
	const wait = require('util').promisify(setTimeout);
	while (!client.isReady()) await wait(500);
}

async function resetRoles(supabase, discord) {
	await waitForDiscordClient(discord);
	for (const guild of discord.guilds.cache.values()) {
		const guild_data = await supabase.fetchGuild(guild.id, discord.application.id)
		await guild.members.fetch();
		const role_manager = guild.roles.cache.find((role) => role.name == guild_data[0].role);
		for (const member of role_manager.members.values()) {
			member.roles.remove(role_manager);
		};
	};
}

module.exports = resetRoles;
