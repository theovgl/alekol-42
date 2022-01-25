const { SlashCommandBuilder } = require("@discordjs/builders")
const axios = require('axios');
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { ClientCredentials } = require('simple-oauth2');
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs().format()
dayjs.extend(relativeTime)

const apiConfig = {
	client: {
		id: process.env.UID_42,
		secret: process.env.SECRET_42
	},
	auth: {
		tokenHost: 'https://api.intra.42.fr',
		tokenPath: '/oauth/token',
		authorizePath: '/oauth/authorize'
	}
};

const apiClient = new ClientCredentials(apiConfig);

async function fetchUser(client, login) {
	let access_token

	try {
		const { token } = await client.getToken({
			scope: 'public'
		})
		access_token = client.createToken(token)
	} catch (error) {
		console.error(error);
	}
	return(axios({
		method: 'GET',
		url: `https://api.intra.42.fr/v2/users/${login}`,
		headers: {
			'Authorization': `Bearer ${access_token.token.access_token}`
		}
	}))
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('Display some informations about an user')
		.addStringOption(option =>
			option.setName('42_login')
				.setDescription('Enter the login of the user you want to spy on')
				.setRequired(true)),
	async execute(interaction) {
		const login = interaction.options.getString('42_login')
		const response = await fetchUser(apiClient, login)
		const embed = new MessageEmbed()
			.setColor('#1abc9c')
			.setTitle(`User informations: ${response.data.login}`)
			.setDescription(`${response.data.displayname}`)
			.setURL(`https://profile.intra.42.fr/users/${response.data.login}`)
			.addFields(
				{ name: 'Is at school ?', value: response.data.location ? `Yes ! **${response.data.location}**` : `No 😢` },
				{ name: '\u200B', value: '\u200B' },
				{ name: 'Correction point(s)', value: `${response.data.correction_point}`, inline: true },
				{ name: '\u200B', value: '\u200B', inline: true },
				{ name: 'Black hole', value: `${dayjs(response.data.cursus_users[1].blackholed_at).fromNow()}`, inline: true },
			)
			.setThumbnail(`${response.data.image_url}`)
			.setTimestamp()

		await interaction.reply({ embeds: [embed] })
	}
}
