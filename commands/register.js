const { SlashCommandBuilder } = require('@discordjs/builders');
const { supabaseClient } = require('../utils/supabaseClient.js');
const ft_api = require('../src/ft_api/fetchUserLocationsByLogin.js');
const users = require('../src/users.js');
const createUserInTree = require('../src/createUserInTree.js');
const client = require('../client.js');

// use Promise.all() here
async function entryExists(discord_id, ft_login, guild_id) {
	{
		const query = supabaseClient
			.from('users')
			.select('ft_id');
		const { data, error } = await query.match({ discord_id, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	{
		const query = supabaseClient
			.from('users')
			.select('ft_id');
		const { data, error } = await query.match({ ft_login, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	return false;
}

async function uploadToDb(discord_id, ft_id, ft_login, guild_id) {
	const { error } = await supabaseClient
		.from('users')
		.insert([
			{ discord_id, ft_login, ft_id, guild_id },
		]);
	if (error) throw (error);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register to the database')
		.addStringOption(option =>
			option.setName('login')
				.setDescription('Your 42 login')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const ft_login = interaction.options.getString('login');
		try {
			if (await entryExists(interaction.user.id, ft_login, interaction.guild.id)) {
				console.error('This entry already exists');
				await interaction.editReply('⛔ You seem to be already registered...');
				return;
			}
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		let response;
		try {
			response = await ft_api.fetchUserLocationByLogin(ft_login);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		if (response.data.length == 0) {
			console.error('No such user at 42');
			await interaction.editReply('⛔ This user does not exist...');
			return;
		}
		const ft_id = response.data.id;

		try {
			await uploadToDb(interaction.user.id, ft_id, ft_login, interaction.guild.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		let user;
		try {
			user = users.find(ft_login)?.data
				?? await createUserInTree(users, ft_login);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		if (!response.data[0].end_at) {
			const location = {
				host: response.data[0].host,
				begin_at: response.data[0].begin_at,
			};
			await user.updateRole(client, location);
		}
		// To delete
		const wait = require('util').promisify(setTimeout);
		await wait(1000);
		await interaction.editReply('✅ You have been successfully registered!');
	},
};
