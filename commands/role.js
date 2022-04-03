const { Permissions, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

function canGiveRole(interaction, role) {
	const bot_can_give = role.comparePositionTo(interaction.guild.me.roles.highest) <= 0;
	const user_can_give = role.comparePositionTo(interaction.member.roles.highest) <= 0;
	const user_is_admin = interaction.member.permissions.has('ADMINISTRATOR');
	const role_is_everyone = role == interaction.guild.roles.everyone;
	const is_managed = role.managed;
	return bot_can_give && (user_can_give || user_is_admin) && !role_is_everyone && !is_managed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Set the role name to give to members'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD, true)) {
			return interaction.editReply('🛑 You need \'Manage Server\' permissions to change the role');
		}
		const roles = interaction.guild.roles.cache
			.filter(role => canGiveRole(interaction, role))
			.map(role => ({ label: role.name, value: role.id }));
		if (roles.length == 0) return interaction.editReply('🛑 You have no permission on any role');
		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('role_selector')
					.setPlaceholder('Nothing selected...')
					.addOptions(roles),
			);
		await interaction.editReply({ components: [row] });
	},
};
