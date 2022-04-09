const supabase = require('@supabase/supabase-js');

let client;
if (process.env.NODE_ENV == 'production'
	|| process.env.NODE_ENV == 'development') {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
	client = supabase.createClient(supabaseUrl, supabaseAnonKey);
}

async function fetchAllGuilds() {
	const { data, error } = await client
		.from('guilds')
		.select('id, name, role');
	if (error) throw (new Error(error.message));
	else return (data);
}

async function fetchGuild(guild_id) {
	const { data, error } = await client
		.from('guilds')
		.select('id, name, role')
		.match({ id: guild_id });
	if (error) throw (new Error(error.message));
	else return (data);
}

async function fetchUserGuilds(discord_id) {
	const { data, error } = await client
		.from('guilds')
		.select('id, name, role, users!inner(ft_login)')
		.eq('users.discord_id', discord_id);
	if (error) throw (new Error(error.message));
	else return (data);
}

async function insertGuild(guild_id, guild_name) {
	const { error } = await client
		.from('guilds')
		.insert([
			{ id: guild_id, name: guild_name },
		]);
	if (error) throw (new Error(error.message));
}

async function setGuildRole(guild_id, role) {
	const { error } = await client
		.from('guilds')
		.update({ role })
		.match({ id: guild_id });
	if (error) throw (new Error(error.message));
}

async function deleteGuild(guild_id) {
	const { data, error } = await client
		.from('guilds')
		.delete()
		.match({ id: guild_id });
	if (error) throw (new Error(error.message));
	return (data);
}

async function fetchUser(user_ids) {
	if (!user_ids
		|| (!user_ids.discord_id
			&& !user_ids.ft_login
			&& !user_ids.guild_id)) throw ('The given user id is invalid');

	const { data, error } = await client
		.from('users')
		.select('discord_id, ft_login, guild_id')
		.match(user_ids);
	if (error) throw (new Error(error.message));
	else return (data);
}

// use Promise.all() here
async function userExists(discord_id, ft_login, guild_id) {
	{
		const { data, error } = await client
			.from('users')
			.select('ft_login')
			.match({ discord_id, guild_id });
		if (error) throw (new Error(error.message));
		if (data.length > 0) return true;
	}
	{
		const { data, error } = await client
			.from('users')
			.select('ft_login')
			.match({ ft_login, guild_id });
		if (error) throw (new Error(error.message));
		if (data.length > 0) return true;
	}
	return false;
}

async function insertUser(discord_id, ft_login, guild_id) {
	const { error } = await client
		.from('users')
		.insert([
			{ discord_id, ft_login, guild_id },
		]);
	if (error) throw (new Error(error.message));
}

async function deleteUser(discord_id, guild_id) {
	const match = { discord_id };
	if (guild_id) match.guild_id = guild_id;
	const { data, error } = await client
		.from('users')
		.delete()
		.match(match);
	if (error) throw (new Error(error.message));
	return (data);
}

async function deleteUsersOfGuild(guild_id) {
	const { data, error } = await client
		.from('users')
		.delete()
		.match({ guild_id });
	if (error) throw (new Error(error.message));
	return (data);
}

async function fetchState(state) {
	const { data, error } = await client
		.from('state')
		.select('guild_id, ft_login')
		.match({ state });
	if (error) throw (new Error(error.message));
	return (data.length > 0 ? data[0] : null);
}

async function insertState(state, guild_id, ft_login) {
	const { error } = await client
		.from('state')
		.insert([
			{ state, ft_login, guild_id },
		]);
	if (error) throw (new Error(error.message));
}

async function updateState(state, state_data) {
	if (!state_data
		|| (!state_data.ft_login
			&& !state_data.guild_id)) throw ('The given state data is invalid');

	const { data, error } = await client
		.from('state')
		.update(state_data)
		.match({ state });
	if (error) throw (new Error(error.message));
	return (data);
}

async function deleteState(state) {
	const { data, error } = await client
		.from('state')
		.delete()
		.match({ state });
	if (error) throw (new Error(error.message));
	return (data);
}

module.exports = { fetchAllGuilds, fetchGuild, insertGuild, setGuildRole, deleteGuild, fetchUser, fetchUserGuilds, userExists, insertUser, deleteUser, deleteUsersOfGuild, fetchState, insertState, updateState, deleteState };
