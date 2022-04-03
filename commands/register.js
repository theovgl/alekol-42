const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const supabase = require('../utils/supabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register to the bot'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		if (!interaction.inGuild()) return interaction.editReply('🚧 This command must be executed in a guild');

		// Generate an OAuth2 state and insert it in the database
		const state = (Math.random() + 1).toString(36);
		await supabase.insertState(state, interaction.guild.id, interaction.member.id);
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Register')
					.setStyle('LINK')
					.setURL(`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&state=${state}`),
			);
		await interaction.editReply({ components: [row] });
	},
};
