const express = require('express');
const supabase = require('./utils/supabase.js');
const discord_api = require('./utils/discord_api.js');
const ft_api = require('./utils/ft_api.js');
const users = require('./src/users.js');
const config = require('./config.js');
const { logAction } = require('./src/logs.js');

module.exports = (discord) => {

	const app = express();

	app.set('view engine', 'pug');

	app.get('/from_42', async (req, res) => {
		const { code, state } = req.query;
		try {
			const user_data = await ft_api.fetchMe(code)
				.catch(async (error) => {
					await supabase.deleteState(state);
					throw { reason: error, message: 'This request seems forged...', code: 400 };
				});
			const state_data = await supabase.updateState(state, { ft_login: user_data.login });
			if (state_data.length == 0) throw { reason: new Error('This request seems forged...'), message: 'This request seems forged...', code: 400 };
		} catch (error) {
			logAction(console.error, error?.message || 'An unknown error occured');
			console.error(error?.reason || error);
			return res.status(error?.code || 500).render('index', { title: 'Error', message: error?.message || 'An unknown error occured' });
		}
		return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.discord.client.id}&redirect_uri=${encodeURIComponent(config.redirect_uri.discord)}&response_type=code&scope=identify&state=${state}`);
	});

	app.get('/from_discord', async (req, res) => {
		const { code, state } = req.query;
		try {
			const [state_data, user_data] = await Promise.all([
				supabase.deleteState(state),
				discord_api.fetchMe(code)
					.catch((error) => {
						throw { reason: error, message: 'This request seems forged...', code: 400 };
					}),
			]);
			if (await supabase.userExists(user_data.id, state_data[0].ft_login, state_data[0].guild_id)) {
				throw { reason: new Error('You are already registered'), message: 'You are already registered', code: 200 };
			}
			// Insert the user in the database
			await supabase.insertUser(user_data.id, state_data[0].ft_login, state_data[0].guild_id);

			// Update the user in the binary tree
			const user = users.find(state_data[0].ft_login)?.data;
			if (user) {
				const guild_member = await discord.guilds.cache.get(state_data[0].guild_id)
					.members.fetch(user_data.id);
				user.guilds_member.push(guild_member);
				// Update the user's role according to its location
				await user.updateRole();
			}
		} catch (error) {
			logAction(console.error, error?.message || 'An unknown error occured');
			console.error(error?.reason || error);
			return res.status(error?.code || 500).render('index', { title: 'Error', message: error?.message || 'An unknown error occured' });
		}
		return res.render('index', { title: 'Succesful registration', message: 'You have been successfuly registered' });
	});

	return app;

};
