const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const supabase = require('./utils/supabase.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.data && command.data.name) {
		client.commands.set(command.data.name, command);
	} else {
		console.error(`file ${file} does not have .data or .data.name property!`);
	}
}

client.once('ready', async () => {
	await client.application.fetch();
	console.log('Discord client ready !');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(error);
	}
});

client.on('guildCreate', async (guild) => {
	while (!client.isReady());
	try {
		await supabase.insertGuild(guild.id, guild.name, client.application.id);
	} catch (error) {
		console.error('guild_id: ', guild.id);
		console.error('guild_name: ', guild.name);
		console.error('client_id: ', client.application.id);
		console.error(error);
		return;
	}
	console.log(`Bot ${client.application.name} (${client.application.id}) joined guild ${guild.name} (${guild.id})`);
});

client.on('guildDelete', async (guild) => {
	while (!client.isReady());
	try {
		await supabase.deleteUsersOfGuild(guild.id, client.application.id);
		await supabase.deleteGuild(guild.id, client.application.id);
	} catch (error) {
		console.error('guild_id: ', guild.id);
		console.error('guild_name: ', guild.name);
		console.error('client_id: ', client.application.id);
		console.error(error);
		return;
	}
	console.log(`Bot ${client.application.name} (${client.application.id}) left guild ${guild.name} (${guild.id})`);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;
