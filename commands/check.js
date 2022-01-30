const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const ft_api = require('../src/ft_api/fetchUserByLogin.js');

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
		let response;
		try {
			response = await ft_api.fetchUserByLogin(ft_login);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		const embed = new MessageEmbed()
			.setColor('#1abc9c')
			.setTitle(`User: ${response.data.login}`)
			.setDescription(`${response.data.displayname}`)
			.setURL(`https://profile.intra.42.fr/users/${response.data.login}`)
			.setThumbnail(`${response.data.image_url}`)
			.addFields(
				{ name: 'Is at school ?', value: response.data.location ? `Yes ! **${response.data.location}**` : 'No 😢' },
				{ name: '\u200B', value: '\u200B' },
				{ name: 'Correction point(s)', value: `${response.data.correction_point}`, inline: true },
				{ name: '\u200B', value: '\u200B', inline: true },
				{ name: 'Black hole', value: `${dayjs(response.data.cursus_users[1].blackholed_at).fromNow()}`, inline: true },
			)
			.setTimestamp();

		await interaction.editReply({ embeds: [embed] });
	},
};
