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

		// Check if the user really wants to unregister
		const sure = interaction.options.getBoolean('sure');
		if (!sure) {
			await interaction.editReply('🥰 We would miss you so much! Thanksfully you are staying!');
			return;
		}
		try {
			// Delete the user and remove its role
			await supabase.deleteUser(interaction.user.id, interaction.guild.id);
			await interaction.member.roles.remove(interaction.guild.roles.cache.find((r) => r.name === 'alekolique'));
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply('Done! 💔');
	},
};
