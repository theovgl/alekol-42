module.exports = function createUserInTree(users, ft_id, ft_login, user_in_guilds) {
	const data = {
		ft_id,
		ft_login,
		guilds: user_in_guilds.map((guild) => {
			return ({
				id: guild.guild_id,
				discord_id: guild.discord_id,
			});
		}),
	};
	console.log('Newly inserted data');
	console.log(data);
	users.insert(ft_login, data);
	return (data);
};
