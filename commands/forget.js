const { SlashCommandBuilder } = require('@discordjs/builders');
const supabase = require('../utils/supabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forget')
		.setDescription('Delete all your informations from our database')
		.addBooleanOption(option =>
			option.setName('sure')
				.setDescription('Are you sure you want to leave?')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const sure = interaction.options.getBoolean('sure');
		if (!sure) {
			await interaction.editReply('🥰 We would miss you so much! Thanksfully you are staying!');
			return;
		}
		try {
			await supabase.deleteUser(interaction.user.id, interaction.guild.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply('Done! 💔');
	},
};
