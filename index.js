const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const supabase = require('./utils/supabase.js');
const ft_api = require('./utils/ft_api.js');
const users = require('./src/users.js');
const initApp = require('./app.js');
const deployCommands = require('./deploy-commands.js');
const resetRoles = require('./src/resetRoles.js');
const { initWebsocket } = require('./utils/websocket.js');
const initUsersMap = require('./src/initUsersMap.js');
const { logAction } = require('./src/logs.js');

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

client.once('ready', async () => {
	logAction(console.log, 'Discord client ready');
	users.discord = client;
	// delete ?
	await Promise.all([
		client.application.fetch(),
		client.guilds.fetch(),
	]);
	// Create the HTTP application
	const app = initApp(supabase, ft_api, client, users);
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		logAction(console.log, `HTTP server listening on port ${PORT}`);
	});
	await Promise.all([
		deployCommands(),
		resetRoles(supabase, client),
	]);
	await Promise.all([
		initUsersMap(supabase, ft_api, client, users),
		initWebsocket(client, supabase, users),
	]);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		logAction(console.error, `An error occured while executing the interaction's command (${interaction.commandName})`);
		console.error(error);
		interaction.editReply('😵 An error occurred... Please try again later!');
	}
});

client.on('guildCreate', async (guild) => {
	// delete ?
	while (!client.isReady());
	guild.fetch();
	try {
		await supabase.insertGuild(guild.id, guild.name, client.application.id);
		logAction(console.log, `Bot ${client.application.name} joined guild ${guild.name}`);
	} catch (error) {
		logAction(console.error, 'An error occured while joining the guild');
		console.error(error);
	}
});

client.on('guildDelete', async (guild) => {
	// delete ?
	while (!client.isReady());
	guild.fetch();
	try {
		await supabase.deleteUsersOfGuild(guild.id, client.application.id);
		await supabase.deleteGuild(guild.id, client.application.id);
		logAction(console.log, `Bot ${client.application.name} left guild ${guild.name}`);
	} catch (error) {
		logAction(console.error, 'An error occured while leaving the guild');
		console.error(error);
	}
});

async function fetchMember(member) {
	try {
		await member.fetch();
	} catch (error) {
		logAction(console.error, 'An error occured while fetching the member');
		console.error(error);
	}
}

client.on('guildMemberAdd', fetchMember);

client.on('guildMemberRemove', async (member) => {
	try {
		const user_data = await supabase.fetchUser({
			discord_id: member.id,
			guild_id: member.guild.id,
			client_id: client.application.id,
		});
		if (!user_data
			|| user_data.length == 0) return;
		const user = users.find(user_data[0].ft_login)?.data;
		if (!user) return;
		await supabase.deleteUser(member.id, member.guild.id, client.application.id);
		user.guilds_member = user.guilds_member.filter((guild_member) => guild_member.guild.id != member.guild.id);
	} catch (error) {
		logAction(console.error, 'An error occured while the member left the guild');
		console.error(error);
		return;
	}
});

client.login(process.env.DISCORD_TOKEN);
