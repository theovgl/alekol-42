const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const supabase = require('../utils/supabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register to the bot'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		let state;
		try {
			state = (Math.random() + 1).toString(36);
			await supabase.insertState(state, interaction.guild.id, interaction.user.id);
		} catch (error) {
			console.error(error);
			await interaction.editReply('😵 An unknown error occurred... Please try again later!');
			return;
		}
		const embed = new MessageEmbed()
			.setColor('#1abc9c')
			.setTitle('Registration request')
			.setDescription('Please follow the link')
			.setURL(`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&state=${state}`);
		await interaction.editReply({ embeds: [embed] });
	},
};
