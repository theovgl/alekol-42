module.exports = class User {
	constructor(ft_id, ft_login, user_in_guilds) {
		this.ft_id = ft_id;
		this.ft_login = ft_login;
		this.guilds = user_in_guilds.map((guild) => {
			return ({
				id: guild.guild_id,
				discord_id: guild.discord_id,
			});
		});
	}
};
