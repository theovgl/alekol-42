const express = require('express');
const ft_api = require('../../../utils/ft_api.js');
const supabase = require('../../../utils/supabase.js');
const validation = require('./validation');

module.exports = (discord) => {

	const route = express.Router();

	route.post('/', async (req, res) => {
		const { code, state } = req.body;
		let state_data;
		let next_step = null;
		try {
			validation.register(req.body);
			// Fetch the state from the database
			state_data = await supabase.fetchState(state);
			if (state_data == null) throw { reason: new Error('The state was not found in the database.'), message: 'The state was not found in the database.', httpCode: 400 };
			if (state_data.ft_login == null) {
				// If the login has not been set yet
				const ft_user = await ft_api.fetchMe(code)
					.catch(async (error) => { // change below
						// await supabase.deleteState(state);
						throw { reason: error, message: 'The given code does not allow to fetch the user\'s data.', httpCode: 400 };
					});
				await supabase.updateState(state, { ft_login: ft_user.login });
				state_data.ft_login = ft_user.login;
				next_step = {
					service: 'Discord',
					location: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI + '/from_discord')}&response_type=code&scope=identify&state=${state}`
				};
			}
		} catch (error) {
			let message;
			if (error?.httpCode == 400) message = 'The request is incorrect...';
			else message = 'An unexpected error occured...';
			console.error(error?.reason || error);
			return res.status(error?.httpCode || 500).json({
				message,
				details: error?.message || 'Please contact an administrator.'
			});
		}
		return res.json({
			user: state_data,
			next: next_step,
		});
	});

	return route;

}
