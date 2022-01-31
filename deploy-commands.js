const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const commands = [];

const commandsFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandsFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

if (NODE_ENV == 'production') {
	rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
} else if (NODE_ENV == 'development') {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered guild application commands.'))
		.catch(console.error);
}
