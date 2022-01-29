const { supabaseClient } = require('../../utils/supabaseClient.js');

async function fetchUser(user_ids) {
	if (!user_ids
		|| (!user_ids.discord_id
			&& !user_ids.ft_id
			&& !user_ids.ft_login)) throw ('The given user id is invalid');

	const { data, error } = await supabaseClient
		.from('users')
		.select('discord_id, ft_id, ft_login, guild_id')
		.match(user_ids);
	if (error) throw (error);
	else return (data);
}

module.exports = fetchUser;
