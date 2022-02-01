const supabase = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

async function fetchUser(user_ids) {
	if (!user_ids
		|| (!user_ids.discord_id
			&& !user_ids.ft_id
			&& !user_ids.ft_login)) throw ('The given user id is invalid');

	const { data, error } = await client
		.from('users')
		.select('discord_id, ft_id, ft_login, guild_id')
		.match(user_ids);
	if (error) throw (error);
	else return (data);
}

// use Promise.all() here
async function userExists(discord_id, ft_login, guild_id) {
	{
		const { data, error } = await client
			.from('users')
			.select('ft_id')
			.match({ discord_id, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	{
		const { data, error } = await client
			.from('users')
			.select('ft_id')
			.match({ ft_login, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	return false;
}

async function insertUser(discord_id, ft_login, ft_id, guild_id) {
	const { error } = await client
		.from('users')
		.insert([
			{ discord_id, ft_login, ft_id, guild_id },
		]);
	if (error) throw (error);
}

async function deleteUser(discord_id, guild_id) {
	const { error } = await client
		.from('users')
		.delete()
		.match({ discord_id, guild_id });
	if (error) throw (error);
}

module.exports = { fetchUser, userExists, insertUser, deleteUser };
