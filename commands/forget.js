const { SlashCommandBuilder } = require('@discordjs/builders');
const { supabaseClient } = require('../utils/supabaseClient.js');

async function deleteFromDb(discord_id, guild_id) {
	const { error } = await supabaseClient
		.from('users')
		.delete()
		.match({ discord_id, guild_id });
	if (error) throw (error);
}

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
			await deleteFromDb(interaction.user.id, interaction.guild.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply('Done! 💔');
	},
};
