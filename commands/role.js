const { SlashCommandBuilder } = require('@discordjs/builders');
const supabase = require('../utils/supabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Set the role name to give to members')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The role name')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const role = interaction.options.getString('name');
		try {
			await supabase.setGuildRole(interaction.guild.id, interaction.applicationId, role);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply('Done');
	},
};
