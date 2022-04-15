const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const supabase = require('../utils/supabase.js');
const ft_api = require('../utils/ft_api.js');
const users = require('../src/users.js');
const { logAction } = require('../src/logs.js');

dayjs().format();
dayjs.extend(relativeTime);

async function fetchLatestLocationTime(ft_login) {
	const response = await ft_api.fetchUserLocationsByLogin(ft_login);
	return response[0]?.end_at;
}

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
		const member_data = await supabase.fetchUser({ discord_id: interaction.user.id });
		if (member_data.length == 0) {
			await interaction.editReply('🛑 You must be registered to access that information');
			return;
		}
		// Get the user from the binary tree
		const user = await users.findWithDb(ft_login);
		const embed = new MessageEmbed()
			.setTitle(ft_login)
			.setDescription(`Is ${user?.host ? '' : 'not '}at school`)
			.setURL(`https://profile.intra.42.fr/users/${ft_login}`)
			.setTimestamp();
		if (user?.host && user?.begin_at) {
			embed.setColor('#1abc9c');
			embed.addField('Host', user.host, true);
			embed.addField('Logged', dayjs(user.begin_at).fromNow(), true);
		} else {
			embed.setColor('#f85a3e');
			try {
				if (!user.end_at) user.end_at = await fetchLatestLocationTime(ft_login);
				if (!user.end_at) return interaction.editReply(`💤 The user ${ft_login} has never logged in`);
			} catch (error) {
				logAction(console.error, `The user ${ft_login} does not exist.`);
				console.error(error);
				await interaction.editReply(`🙅 The user ${ft_login} does not exist`);
				return;
			}
			embed.addField('Last seen', dayjs(user.end_at).fromNow(), true);
		}
		await interaction.editReply({ embeds: [embed] });
	},
};
