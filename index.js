const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const { logAction } = require('./src/logs.js');
const discord = require('./utils/discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.data && command.data.name) {
		client.commands.set(command.data.name, command);
	} else {
		logAction(console.error, `File ${file} does not have .data or .data.name property!`);
	}
}

client.once('ready', discord.onReady);
client.on('interactionCreate', discord.onInteractionCreate);
client.on('guildCreate', discord.onGuildCreate);
client.on('guildDelete', discord.onGuildDelete);
client.on('guildMemberAdd', discord.onGuildMemberAdd);
client.on('guildMemberRemove', discord.onGuildMemberRemove);

client.login(process.env.DISCORD_TOKEN);
