const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.data && command.data.name) {
		client.commands.set(command.data.name, command);
	} else {
		console.error(`file ${file} does not have .data or .data.name property!`);
	}
}

client.once('ready', () => {
	console.log('Discord client ready !');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;
