const { Permissions } = require('discord.js');
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
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD, true)) {
			await interaction.editReply('🛑 You need \'Manage Server\' permissions to change the role');
			return ;
		}
		const role_name = interaction.options.getString('name');

		const guild_data = await supabase.fetchGuild(interaction.guildId, interaction.applicationId);
		await supabase.setGuildRole(interaction.guildId, interaction.applicationId, role_name);
		const role_manager = interaction.guild.roles.cache.find(role => role.name == guild_data[0].role);
		let new_role_manager = interaction.guild.roles.cache.find(role => role.name == role_name);
		if (!new_role_manager) new_role_manager = await interaction.guild.roles.create({ name: role_name });
		if (role_manager) {
			const requests = [];
			role_manager.members.forEach((member) => {
				requests.push(member.roles.remove(role_manager).then(() => member.roles.add(new_role_manager)));
			});
			await Promise.all(requests);
		}
		await interaction.editReply('Done!');
	},
};
