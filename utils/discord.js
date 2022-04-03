const { MessageEmbed } = require('discord.js');
const initApp = require('../app.js');
const deployCommands = require('../deploy-commands.js');
const initUsersMap = require('../src/initUsersMap.js');
const { logAction } = require('../src/logs.js');
const resetRoles = require('../src/resetRoles.js');
const supabase = require('./supabase.js');
const users = require('../src/users.js');
const { initWebsocket } = require('./websocket.js');
const ws_healthcheck = require('../src/ws_healthcheck.js');
const ft_api = require('./ft_api.js');

const DEFAULT_ROLE = process.env.DEFAULT_ROLE || 'worker';
let disconnected = false;

async function onGuildCreate(guild) {
	try {
		await supabase.insertGuild(guild.id, guild.name, guild.client.application.id);
		const new_role_manager = guild.roles.cache.find(role => role.name == DEFAULT_ROLE);
		if (!new_role_manager) await guild.roles.create({ name: DEFAULT_ROLE });
		logAction(console.log, `Joined guild ${guild.name}`);
	} catch (error) {
		logAction(console.error, 'An error occured while joining the guild');
		console.error(error);
	}
}

async function onGuildDelete(guild) {
	try {
		await Promise.all([
			supabase.deleteUsersOfGuild(guild.id, guild.client.application.id),
			supabase.deleteGuild(guild.id, guild.client.application.id),
		]);
		logAction(console.log, `Left guild ${guild.name}`);
	} catch (error) {
		logAction(console.error, 'An error occured while leaving the guild');
		console.error(error);
	}
}

async function onGuildMemberAdd(member) {
	try {
		await member.fetch();
	} catch (error) {
		logAction(console.error, 'An error occured while fetching the member');
		console.error(error);
	}
}

async function onGuildMemberRemove(member) {
	try {
		const user_data = await supabase.deleteUser(member.id, member.guild.id, member.client.application.id);
		if (user_data.length == 0) return;
		const user = users.find(user_data[0].ft_login)?.data;
		if (!user) return;
		user.guilds_member = user.guilds_member.filter((guild_member) => guild_member.guild.id != member.guild.id);
	} catch (error) {
		logAction(console.error, 'An error occured while the member left the guild');
		console.error(error);
	}
}

async function changeGuildRole(interaction) {
	const role_id = interaction.values[0];

	// Get the new role manager
	const new_role_manager = interaction.guild.roles.cache.get(role_id);
	if (!new_role_manager) return interaction.update({ content: '🤔 This role does not exist anymore', components: [] });

	// Get the old role manager
	const guild_data = await supabase.fetchGuild(interaction.guildId, interaction.applicationId);
	const role_manager = interaction.guild.roles.cache.get(guild_data[0].role);

	// Change the guild role
	await supabase.setGuildRole(interaction.guildId, interaction.applicationId, role_id);
	if (role_manager) {
		const requests = [];
		role_manager.members.forEach((member) => {
			requests.push(member.roles.remove(role_manager).then(() => member.roles.add(new_role_manager)));
		});
		await Promise.all(requests);
	}
	const embed = new MessageEmbed()
		.setColor(new_role_manager.color)
		.setTitle('Role update')
		.setDescription('The role has been successfully updated!')
		.addField('Name', new_role_manager.name, false);
	return interaction.update({ components: [], embeds: [embed] });
}

async function onInteractionCreate(interaction) {
	try {
		if (interaction.isCommand()) {
			const command = this.commands.get(interaction.commandName);
			if (!command) return;
			return await command.execute(interaction);
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId === 'role_selector') return await changeGuildRole(interaction);
		}
	} catch (error) {
		logAction(console.error, `An error occured while executing the interaction's command (${interaction.commandName})`);
		console.error(error);
		if (interaction.isCommand()) return interaction.editReply('😵 An error occurred... Please try again later!');
		else if (interaction.isSelectMenu()) return interaction.update({ content: '😵 An error occurred... Please try again later!', components: [] });
	}
}

async function onReady(client) {
	logAction(console.log, 'Discord client ready');
	users.discord = client;
	// delete ?
	await Promise.all([
		client.application.fetch(),
		client.guilds.fetch(),
	]);
	// Create the HTTP application
	const app = initApp(client);
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		logAction(console.log, `HTTP server listening on port ${PORT}`);
	});
	await Promise.all([
		deployCommands(),
		resetRoles(client),
	]);
	let ws = initWebsocket();
	setInterval(async () => {
		try {
			const latest_location = await ft_api.getLatestActiveLocation();
			if (latest_location.id > ws_healthcheck.latest_ws_id + 20) {
				disconnected = true;
				logAction(console.log, 'Websocket seems broken, going to sleep...');
				client.user.setStatus('idle');
				ws.close();
				ws = initWebsocket();
			} else if (disconnected) {
				disconnected = false;
				logAction(console.log, 'Websocket reconnected!');
				client.user.setStatus('online');
			}
		} catch (error) {
			console.error(error);
		}
	}, 60 * 1000);
	await Promise.all([
		initUsersMap(),
	]);
}

module.exports = {
	onGuildCreate,
	onGuildDelete,
	onGuildMemberAdd,
	onGuildMemberRemove,
	onInteractionCreate,
	onReady,
};
