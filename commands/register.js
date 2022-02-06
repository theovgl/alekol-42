const { SlashCommandBuilder } = require('@discordjs/builders');
const supabase = require('../utils/supabase.js');
const ft_api = require('../utils/ft_api.js');
const users = require('../src/users.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register to the bot'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		let state;
		try {
			state = (Math.random() + 1).toString(36);
			await supabase.insertState(state, interaction.guild.id, interaction.user.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply(`Follow the link dumb bitch\nhttps://api.intra.42.fr/oauth/authorize?client_id=137cb6a1ee4053050015749731fd55dcfe71a54cfce122a5ac42696e428a0c8d&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&state=${state}`);
	},
};
