const { SlashCommandBuilder } = require("@discordjs/builders")
const { supabaseClient } = require('../utils/supabaseClient.js')
const axios = require('axios')
const apiClient = require('../utils/ft_client.js')

async function checkLogin(login) {
	let access_token

	try {
		const { token } = await apiClient.getToken({
			scope: 'public'
		})
		access_token = apiClient.createToken(token)
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

async function uploadToDb(id, login) {
	const response = await checkLogin(login)
	const ft_id = response.data.id

	const { data, error } = await supabaseClient
		.from("users")
		.insert([
			{ ft_login: login, discord_id: id, ft_id: ft_id }
		])
	if (error) {
		console.log(error)
		if (error.code === '23505') {
			if (error.details.includes('discord_id')) {
				return ('e_discord_id')
			} else if (error.details.includes('login_42')) {
				return ('e_login_42')
			}
		}
	} else {
		return ('done')
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register to the database')
		.addStringOption(option =>
			option.setName('42_login')
				.setDescription('Your 42 login')
				.setRequired(true)),
	async execute(interaction) {
		const wait = require('util').promisify(setTimeout)
		const string = interaction.options.getString('42_login')
		const response = await uploadToDb(interaction.user.id, string)
		await interaction.deferReply({ ephemeral: true })
		await wait(1000)
		if (response === 'e_login_42') {
			await interaction.editReply('⛔ Sorry **' + string + '** is already in our database')
		} else if (response === 'e_discord_id') {
			await interaction.editReply('⛔ Sorry your discord ID (*' + interaction.user.id +'*) is already in our database')
		} else if (response === 'e_bad_login') {
			await interaction.editReply('⛔ Sorry **' + string + '** seems to be absent from 42 api')
		}else if (response === 'done') {
			await interaction.editReply('✅ User Registration Successful !')
		}
	}
}
