const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const supabase = require('../utils/supabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('auth')
		.setDescription('Manage your authentication to the bot'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const embed = new MessageEmbed()
			.setTitle('Your authentication');
		const row = new MessageActionRow();

		// Fetch the user's data
		const user_data = await supabase.fetchUser({ discord_id: interaction.user.id });
		if ((interaction.inGuild() &&
				user_data.filter(user => user.guild_id == interaction.guildId).length == 0)
			|| user_data.length == 0) {
			// Generate an OAuth2 state and insert it in the database
			const state = (Math.random() + 1).toString(36);
			await supabase.insertState(state, interaction.guildId);
			embed.setDescription('You are not registered');
			row.addComponents(
				new MessageButton()
					.setLabel('Register')
					.setStyle('LINK')
					.setURL(`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI + '/from_42')}&response_type=code&state=${state}`),
			);
		} else {
			embed.setDescription('You are registered');
			const guilds_count = user_data.filter(user => user.guild_id != null).length;
			embed.addField('Active guilds', guilds_count.toString(), true);
			row.addComponents(
				new MessageButton()
					.setCustomId('unregister')
					.setLabel('Unregister' + (interaction.inGuild() ? '' : ' from all guilds'))
					.setStyle('DANGER'),
			);
		}
		await interaction.editReply({ embeds: [embed], components: [row] });
	},
};
