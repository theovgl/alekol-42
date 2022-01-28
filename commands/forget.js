const { SlashCommandBuilder } = require('@discordjs/builders');
const { supabaseClient } = require('../utils/supabaseClient.js');

async function deleteFromDb(id) {
	const { error } = await supabaseClient
		.from('users')
		.delete()
		.match({ discord_id: id });
	if (error) {
		console.log(error);
		return ('error');
	}
	else {return ('done');}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forget')
		.setDescription('Delete all your informations from our database')
		.addBooleanOption(option =>
			option.setName('sure')
				.setDescription('We\'ll miss you')
				.setRequired(true)),
	async execute(interaction) {
		const response = await deleteFromDb(interaction.user.id);
		if (response === 'done') {
			await interaction.reply('Done ! 💔');
		}
		else {
			await interaction.reply('❌ Oups, something went wrong !');
		}
	},
};
