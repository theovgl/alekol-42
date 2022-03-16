const { SlashCommandBuilder } = require('@discordjs/builders');
const supabase = require('../utils/supabase.js');
const users = require('../src/users.js');

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

		// Check if the user really wants to unregister
		if (!sure) {
			await interaction.editReply('🥰 We would miss you so much! Thanksfully you are staying!');
			return;
		}
		// Delete the user and remove its role
		const user_data = await supabase.deleteUser(interaction.member.id, interaction.guild.id, interaction.applicationId);
		const user = users.find(user_data[0].ft_login)?.data;
		if (!user) return;
		user.guilds_member = user.guilds_member.filter((guild_member) => guild_member.guild.id != interaction.guild.id);
		await interaction.member.roles.remove(interaction.guild.roles.cache.find((r) => r.name === 'alekolique'));
		await interaction.editReply('You have been unregistered... 💔');
	},
};
