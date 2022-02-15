const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const supabase = require('../utils/supabase.js');
const users = require('../src/users.js');

dayjs().format();
dayjs.extend(relativeTime);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('Display some informations about an user')
		.addStringOption(option =>
			option.setName('login')
				.setDescription('Enter the login of the user you want to spy on')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const ft_login = interaction.options.getString('login');

		// Check that the member is registered
		const member_data = await supabase.fetchUser({ discord_id: interaction.user.id, guild_id: interaction.guildId });
		if (member_data.length == 0) {
			await interaction.editReply('🛑 You must be registered to access that information');
			return;
		}
		// Get the user from the binary tree
		const user = users.find(ft_login)?.data;
		const embed = new MessageEmbed()
			.setColor('#1abc9c')
			.setTitle(ft_login)
			.setDescription(`Is ${user?.host ? '' : 'not '}at school`)
			.setURL(`https://profile.intra.42.fr/users/${ft_login}`)
			.setTimestamp();
		if (user?.host) embed.addField('Host', user.host, true);
		if (user?.begin_at) embed.addField('Since', dayjs(user.begin_at).fromNow(), true);
		await interaction.editReply({ embeds: [embed] });
	},
};
