const dotenv = require('dotenv')
const { Client, Collection, Intents } = require('discord.js')
const fs = require('fs')
// const

dotenv.config()

const config = {
	client: {
	  id: process.env.UID_42,
	  secret: process.env.SECRET_42
	},
	auth: {
	  tokenHost: 'https://api.intra.42.fr/'
	}
  };

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

client.once('ready', () => {
	console.log('Ready !')
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return

	const command = client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.log(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})

client.login(process.env.DISCORD_TOKEN)
