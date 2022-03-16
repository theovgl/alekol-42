const supabase = require('@supabase/supabase-js');

let client;
if (process.env.NODE_ENV == 'production'
	|| process.env.NODE_ENV == 'development') {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
	client = supabase.createClient(supabaseUrl, supabaseAnonKey);
}

async function fetchGuild(guild_id, client_id) {
	const { data, error } = await client
		.from('guilds')
		.select('id, name, client_id, role')
		.match({ id: guild_id, client_id });
	if (error) throw (error);
	else return (data);
}

async function insertGuild(guild_id, guild_name, client_id) {
	const { error } = await client
		.from('guilds')
		.insert([
			{ id: guild_id, name: guild_name, client_id },
		]);
	if (error) throw (error);
}

async function setGuildRole(guild_id, client_id, role) {
	const { error } = await client
		.from('guilds')
		.update({ role })
		.match({ id: guild_id, client_id });
	if (error) throw (error);
}

async function deleteGuild(guild_id, client_id) {
	const { data, error } = await client
		.from('guilds')
		.delete()
		.match({ id: guild_id, client_id });
	if (error) throw (error);
	return (data);
}

async function fetchUser(user_ids) {
	if (!user_ids
		|| (!user_ids.discord_id
			&& !user_ids.ft_login)) throw ('The given user id is invalid');

	const { data, error } = await client
		.from('users')
		.select('discord_id, ft_login, guild_id')
		.match(user_ids);
	if (error) throw (error);
	else return (data);
}

// use Promise.all() here
async function userExists(discord_id, ft_login, guild_id) {
	{
		const { data, error } = await client
			.from('users')
			.select('ft_login')
			.match({ discord_id, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	{
		const { data, error } = await client
			.from('users')
			.select('ft_login')
			.match({ ft_login, guild_id });
		if (error) throw (error);
		if (data.length > 0) return true;
	}
	return false;
}

async function insertUser(discord_id, ft_login, guild_id, client_id) {
	const { error } = await client
		.from('users')
		.insert([
			{ discord_id, ft_login, guild_id, client_id },
		]);
	if (error) throw (error);
}

async function deleteUser(discord_id, guild_id, client_id) {
	const { data, error } = await client
		.from('users')
		.delete()
		.match({ discord_id, guild_id, client_id });
	if (error) throw (error);
	return (data);
}

async function deleteUsersOfGuild(guild_id, client_id) {
	const { data, error } = await client
		.from('users')
		.delete()
		.match({ guild_id, client_id });
	if (error) throw (error);
	return (data);
}

async function fetchState(state) {
	const { data, error } = await client
		.from('state')
		.select('discord_id, guild_id')
		.match({ state });
	if (error) throw (error);
	deleteState(state);
	return (data.length ? data[0] : null);
}

async function insertState(state, guild_id, discord_id) {
	const { error } = await client
		.from('state')
		.insert([
			{ state, discord_id, guild_id },
		]);
	if (error) throw (error);
}

async function deleteState(state) {
	const { data, error } = await client
		.from('state')
		.delete()
		.match({ state });
	if (error) throw (error);
	return (data);
}

module.exports = { fetchGuild, insertGuild, setGuildRole, deleteGuild, fetchUser, userExists, insertUser, deleteUser, deleteUsersOfGuild, fetchState, insertState };
