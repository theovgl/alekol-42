const express = require('express');
const supabase = require('./utils/supabase.js');
const ft_api = require('./utils/ft_api.js');
const users = require('./src/users.js');
const { logAction } = require('./src/logs.js');

module.exports = (discord) => {

	const app = express();

	app.set('view engine', 'pug');

	app.get('/', async (req, res) => {
		const { code, state } = req.query;
		let user;
		try {
			const [state_data, user_data] = await Promise.all([
				supabase.fetchState(state),
				ft_api.fetchMe(code)
					.catch(() => {
						throw ({ message: 'This requests seems forged...', code: '400' });
					}),
			]);
			if (!state_data) throw { message: 'This requests seems forged...', code: '400' };
			if (await supabase.userExists(state_data.discord_id, user_data.login, state_data.guild_id)) throw { message: 'You are already registered', code: '200' };

			// Insert the user in the database
			await supabase.insertUser(state_data.discord_id, user_data.login, state_data.guild_id, discord.application.id);

			user = users.find(user_data.login)?.data;
			if (user) {
				const guild_member = await discord.guilds.cache.get(state_data.guild_id)
					.members.fetch(state_data.discord_id);
				user.guilds_member.push(guild_member);
				// Update the user's role according to its location
				await user.updateRole();
			}
		} catch (error) {
			logAction(console.error, error?.message || 'An unknown error occured');
			console.error(error);
			return res.status(error?.code || 500).render('index', { title: 'Error', message: error?.message || 'An unknown error occured' });
		}
		return res.render('index', { title: 'Succesful registration', message: 'You have been successfuly registered' });
	});

	return app;

};
