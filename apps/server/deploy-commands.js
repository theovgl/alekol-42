const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const config = require('./config.js');
const { logAction } = require('./src/logs.js');

const environment = process.env.NODE_ENV ?? 'development';

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
	const rest = new REST({ version: '9' }).setToken(config.discord.bot_token);
	if (environment == 'production') {
		await rest.put(Routes.applicationCommands(config.discord.client.id), { body: commands })
			.then(() => logAction(console.log, 'Registered application commands'))
			.catch(console.error);
	} else if (environment == 'development' && config.discord.guild_id) {
		await rest.put(Routes.applicationGuildCommands(config.discord.client.id, config.discord.guild_id), { body: commands })
			.then(() => logAction(console.log, 'Registered guild application commands'))
			.catch(console.error);
	}
}

module.exports = deployCommands;
