const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { logAction } = require('./src/logs.js');

const environment = process.env.NODE_ENV ?? 'development';
const client_id = process.env.DISCORD_CLIENT_ID;
const guild_id = process.env.DISCORD_GUILD_ID;

async function deployCommands() {
	logAction(console.log, 'Registering commands');
	// Read all commands inside an array
	const commands = [];
	const commandsFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandsFiles) {
		const command = require(`./commands/${file}`);
		if (environment == 'development') command.data.setDescription('🛠️ ' + command.data.description);
		commands.push(command.data.toJSON());
	}

	// Put the commands to the Discord API
	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
	if (environment == 'production') {
		await rest.put(Routes.applicationCommands(client_id), { body: commands })
			.then(() => logAction(console.log, 'Registered application commands'))
			.catch(console.error);
	} else if (environment == 'development') {
		await rest.put(Routes.applicationGuildCommands(client_id, guild_id), { body: commands })
			.then(() => logAction(console.log, 'Registered guild application commands'))
			.catch(console.error);
	}
}

module.exports = deployCommands;
