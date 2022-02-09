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
		const role_name = interaction.options.getString('name');
		try {
			const guild_data = await supabase.fetchGuild(interaction.guildId, interaction.applicationId);
			await supabase.setGuildRole(interaction.guildId, interaction.applicationId, role_name);
			await interaction.guild.members.fetch();
			const role_manager = interaction.guild.roles.cache.find(role => role.name == guild_data[0].role);
			const new_role_manager = interaction.guild.roles.cache.find(role => role.name == role_name);
			interaction.guild.members.cache.forEach((member) => {
				console.log(member.displayName);
			});
			role_manager.members.forEach((member) => {
				member.roles.remove(role_manager);
				member.roles.add(new_role_manager);
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		await interaction.editReply('Done');
	},
};
