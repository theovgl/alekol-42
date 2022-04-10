const express = require('express');
const discord_api = require('../../../utils/discord_api.js');
const ft_api = require('../../../utils/ft_api.js');
const supabase = require('../../../utils/supabase.js');
const users = require('../../../src/users.js');
const validation = require('./validation');

async function ft_registration(state_data, code) {
	const ft_user = await ft_api.fetchMe(code)
		.catch(async (error) => {
			await supabase.deleteState(state_data.state);
			throw { reason: error, message: 'The given code does not allow to fetch the user\'s data.', httpCode: 400 };
		});
	await supabase.updateState(state_data.state, { ft_login: ft_user.login });
	state_data.ft_login = ft_user.login;
	return {
		service: 'Discord',
		location: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI + '/register')}&response_type=code&scope=identify&state=${state_data.state}`
	};
}

async function discord_registration(state_data, code) {
	const discord_user = await discord_api.fetchMe(code)
		.catch(async (error) => {
			await supabase.deleteState(state_data.state);
			throw { reason: error, message: 'The given code does not allow to fetch the user\'s data.', httpCode: 400 };
		});
	if (await supabase.userExists(discord_user.id, state_data.ft_login, state_data.guild_id)) return null;
	// Insert the user in the database
	await supabase.insertUser(discord_user.id, state_data.ft_login, state_data.guild_id);
	await supabase.deleteState(state_data.state);
	// Update the user in the binary tree
	const user = users.find(state_data.ft_login)?.data;
	if (user) {
		const guild_member = await discord.guilds.cache.get(state_data.guild_id)
			.members.fetch(discord_user.id);
		user.guilds_member.push(guild_member);
		// Update the user's role according to its location
		await user.updateRole();
	}
	return null;
}

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
			if (state_data.ft_login == null) next_step = await ft_registration(state_data, code);
			else next_step = await discord_registration(state_data, code);
		} catch (error) {
			let message;
			if (error?.httpCode == 400) message = 'The request is incorrect...';
			else message = 'An unexpected error occured...';
			console.error(error?.reason || error);
			return res.status(error?.httpCode || 500).json({
				message,
				details: error?.httpCode ? error?.message : 'Please contact an administrator.'
			});
		}
		return res.json({
			user: state_data,
			next: next_step,
		});
	});

	return route;

}
