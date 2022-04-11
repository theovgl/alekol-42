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

let disconnected = false;

async function onGuildCreate(guild) {
	try {
		await supabase.insertGuild(guild.id, guild.name);
		logAction(console.log, `Joined guild ${guild.name}`);
	} catch (error) {
		logAction(console.error, 'An error occured while joining the guild');
		console.error(error);
	}
}

async function onGuildDelete(guild) {
	try {
		await Promise.all([
			supabase.deleteUsersOfGuild(guild.id),
			supabase.deleteStatesOfGuild(guild.id),
		]);
		await supabase.deleteGuild(guild.id);
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
		const user_data = await supabase.deleteUser(member.id, member.guild.id);
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
	const guild_data = await supabase.fetchGuild(interaction.guildId);
	const role_manager = interaction.guild.roles.cache.get(guild_data[0].role);

	// Change the guild role
	await supabase.setGuildRole(interaction.guildId, role_id);
	if (role_manager) {
		const requests = [];
		const users_data = await supabase.fetchUser({ guild_id: interaction.guildId });
		for (const user_data of users_data) {
			const member = interaction.guild.members.cache.get(user_data.discord_id);
			if (!member) continue ;
			requests.push(member.roles.remove(role_manager)
				.then(() => member.roles.add(new_role_manager))
				.catch((error) => {
					logAction(console.error, 'An error occured while changing user\'s roles');
					console.error(error);
				}));
		}
		await Promise.all(requests);
	}
	const embed = new MessageEmbed()
		.setColor(new_role_manager.color)
		.setTitle('Role update')
		.setDescription('The role has been successfully updated!')
		.addField('Name', new_role_manager.name, false);
	return interaction.update({ components: [], embeds: [embed] });
}

async function deleteUser(interaction) {
	// Delete the user and remove its role
	const users_data = await supabase.deleteUser(interaction.user.id, interaction.guildId);
	if (interaction.inGuild()) {
		const user = users.find(users_data[0].ft_login)?.data;
		if (user) {
			user.guilds_member = user.guilds_member.filter((guild_member) => guild_member.guild.id != interaction.guildId);
		}
		const guild_data = await supabase.fetchGuild(interaction.guildId);
		await interaction.member.roles.remove(interaction.guild.roles.cache.get(guild_data[0].role));
	} else {
		const already_deleted = [];
		for (const user_data of users_data) {
			if (already_deleted.includes(user_data.ft_login)) continue ;
			const user = users.find(user_data.ft_login)?.data;
			if (user) {
				user.guilds_member = user.guilds_member.filter((guild_member) => guild_member.id != interaction.user.id);
			}
			already_deleted.push(user_data.ft_login);
		}
		const guilds_data = await supabase.fetchUserGuilds(interaction.user.id);
		const requests = [];
		for (const guild_data of guilds_data) {
			const guild = interaction.client.guilds.cache.get(guild_data.id);
			if (!guild) continue ;
			const member = guild.members.cache.get(interaction.user.id);
			if (!member) continue ;
			requests.push(member.roles.remove(guild_data.role).catch((error) => {
				logAction(console.error, 'An error occured while removing the member\'s role');
				console.error(error);
			}));
		}
		await Promise.all(requests);
	}
	await interaction.update({ content: 'You have been unregistered... 💔', embeds: [], components: [] });
}

async function onInteractionCreate(interaction) {
	try {
		if (interaction.isCommand()) {
			const command = this.commands.get(interaction.commandName);
			if (!command) return;
			return await command.execute(interaction);
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId === 'role_selector') return await changeGuildRole(interaction);
		} else if (interaction.isButton()) {
			if (interaction.customId === 'unregister') return await deleteUser(interaction);
		}
	} catch (error) {
		logAction(console.error, 'An error occured while executing the interaction');
		console.error(error);
		if (interaction.isCommand()) return interaction.editReply('😵 An error occurred... Please try again later!');
		else if (interaction.isSelectMenu() || interaction.isButton()) return interaction.update({ content: '😵 An error occurred... Please try again later!', components: [] });
	}
}

async function checkHandledGuilds(client) {
	const guilds_data = await supabase.fetchAllGuilds();
	// If the bot joined a guild
	for (const guild of client.guilds.cache.values()) {
		if (guilds_data.filter(guild_data => guild_data.id == guild.id).length == 0) {
			await onGuildCreate(guild);
		}
	}
	// If the bot left a guild
	for (const guild_data of guilds_data) {
		if (client.guilds.cache.get(guild_data.id) == null) {
			await onGuildDelete({ id: guild_data.id, name: guild_data.name });
		}
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
	await checkHandledGuilds(client);
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
