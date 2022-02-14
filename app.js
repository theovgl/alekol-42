const express = require('express');

module.exports = (supabase, ft_api, discord, users) => {

	const app = express();

	app.set('view engine', 'pug');

	app.get('/', async (req, res) => {
		const { code, state } = req.query;
		let user;
		try {
			// Check the OAuth2 state
			const state_data = await supabase.fetchState(state);
			if (!state_data) throw { message: 'This requests seems forged...', code: '400' };

			// Get the user associated to the authorization code
			const user_data = await ft_api.fetchMe(code);

			// Check if the user is already registered
			if (await supabase.userExists(state_data.discord_id, user_data.login, state_data.guild_id)) throw { message: 'You are already registered', code: '200' };

			// Insert the user in the database
			await supabase.insertUser(state_data.discord_id, user_data.login, state_data.guild_id, discord.application.id);

			user = users.find(user_data.login)?.data;
			if (user) {
				user.guilds.push({
					id: state_data.guild_id,
					discord_id: state_data.discord_id,
				});
				// Update the user's role according to its location
				await user.updateRole(supabase, discord);
			}
		} catch (error) {
			console.error(error);
			return res.status(error?.code || 500).render('index', { title: 'Error', message: error?.message || 'An unknown error occured' });
		}
		return res.render('index', { title: 'Succesful registration', message: 'You have been successfuly registered' });
	});

	return app;

};
