const { SlashCommandBuilder } = require('@discordjs/builders');
const supabase = require('../utils/supabase.js');
const ft_api = require('../src/ft_api/fetchUserLocationsByLogin.js');
const users = require('../src/users.js');

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

		let response;
		let user;
		try {
			if (await supabase.userExists(interaction.user.id, ft_login, interaction.guild.id)) {
				console.error('The user is already registered');
				await interaction.editReply('⛔ You seem to be already registered...');
				return;
			}
			response = await ft_api.fetchUserLocationsByLogin(ft_login);
			if (response.data.length == 0) {
				console.error('No such user at 42');
				await interaction.editReply('⛔ This user does not exist...');
				return;
			}
			const ft_id = response.data[0].user.id;

			await supabase.insertUser(interaction.user.id, ft_login, ft_id, interaction.guild.id);
			user = users.find(ft_login)?.data
				?? await users.insertFromDb(supabase, ft_login);
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
			await user.updateRole(interaction.user.client, location);
			this.host = location.host;
			this.begin_at = location.begin_at;
		}
		// To delete
		const wait = require('util').promisify(setTimeout);
		await wait(1000);
		console.log(`User (${ft_login}) has been registered!`);
		await interaction.editReply('✅ You have been successfully registered!');
	},
};
