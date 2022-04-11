const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	discord: {
		bot_token: process.env.DISCORD_TOKEN,
		client: {
			id: process.env.DISCORD_CLIENT_ID,
			secret: process.env.DISCORD_CLIENT_SECRET,
		},
		guild_id: process.env.DISCORD_GUILD_ID,
	},
	ft: {
		client: {
			id: process.env.UID_42,
			secret: process.env.SECRET_42,
		},
		cookie: process.env.FT_USER_ID,
		user_id: process.env.FT_CABLE_USER_ID,
	},
	redirect_uri: {
		base: process.env.REDIRECT_URI,
		discord: `${process.env.REDIRECT_URI}/from_discord`,
		ft: `${process.env.REDIRECT_URI}/from_42`,
	},
	supabase: {
		url: process.env.SUPABASE_URL,
		anon_key: process.env.SUPABASE_ANON_KEY,
	},
};
