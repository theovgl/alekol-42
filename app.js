const express = require('express');

module.exports = (supabase, ft_api, discord, users) => {

	const app = express();

	app.get('/', async (req, res) => {
		const { code, state } = req.query;
		let user;
		let locations;
		try {
			const state_data = await supabase.fetchState(state);
			if (!state_data) throw { message: 'This requests seems forged...', code: '400' };
			const user_data = await ft_api.fetchMe(code);
			if (await supabase.userExists(state_data.discord_id, user_data.login, state_data.guild_id)) throw { message: 'You are already registered', code: '200' };
			await supabase.insertUser(state_data.discord_id, user_data.login, user_data.id, state_data.guild_id);
			locations = await ft_api.fetchUserLocationsByLogin(user_data.login);
			if (locations.length == 0) return res.send('ok');
			user = users.find(user_data.login)?.data
				?? await users.insertFromDb(supabase, user_data.login);
		} catch (error) {
			return res.status(error?.code || 500).send(error?.message || 'An unknown error occured');
		}
		let new_location = null;
		if (!locations[0].end_at) new_location = { host: locations[0].host, begin_at: locations[0].begin_at };
		await user.updateRole(discord, new_location);
		return res.send('ok');
	});

	return app;

};
