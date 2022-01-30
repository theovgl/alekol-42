const { SlashCommandBuilder } = require('@discordjs/builders');
const { supabaseClient } = require('../utils/supabaseClient.js');
const ft_api = require('../src/ft_api/fetchUserByLogin.js');

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

async function uploadToDb(discord_id, ft_login, guild_id) {
	const response = await ft_api.fetchUserByLogin(ft_login);
	const ft_id = response.data.id;

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
		try {
			await uploadToDb(interaction.user.id, ft_login, interaction.guild.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		// To delete
		const wait = require('util').promisify(setTimeout);
		await wait(1000);
		await interaction.editReply('✅ You have been successfully registered!');
	},
};
