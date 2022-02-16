const { faker } = require('@faker-js/faker');
const User = require('../src/User.js');

global.console = {
	log: jest.fn(),
	error: jest.fn()
};

const ft_login = faker.internet.userName();
let user_guilds = [];
for (let i = 0; i < 5; i++) {
	user_guilds.push({
		guild_id: faker.datatype.number().toString(),
		discord_id: faker.datatype.number().toString()
	});
}
let user;
let user_host;
let user_begin_at;
let mockGetGuildMembers;
let mockGetCachedGuild;
const application_id = faker.datatype.number().toString();
let mockDiscordClient;
const guild_data = {
	id: faker.datatype.number().toString(),
	name: faker.company.companyName(),
	client_id: faker.datatype.number().toString(),
	role: faker.name.jobType()
};
let mockSupabase;
beforeEach(() => {
	user = new User(ft_login, user_guilds);
	user.host = user_host;
	user.begin_at = user_begin_at;
	mockGetGuildMembers = {
		guild: {
			roles: {
				cache: {
					find: jest.fn().mockReturnValue({})
				}
			}
		},
		roles: {
			add: jest.fn(),
			remove: jest.fn()
		}
	};
	mockGetCachedGuild = {
		members: {
			fetch: jest.fn().mockResolvedValue(mockGetGuildMembers)
		},
	};
	mockDiscordClient = {
		application: {
			id: application_id
		},
		guilds: {
			cache: {
				get: jest.fn().mockReturnValue(mockGetCachedGuild)
			}
		}
	};
	mockSupabase = {
		fetchGuild: jest.fn().mockResolvedValue([guild_data])
	};
});

describe('updateRole', () => {

	const configs = [
		{ message: 'in', user: { host: faker.internet.ip(), begin_at: faker.date.recent() } },
		{ message: 'out', user: { host: null, begin_at: null } }
	];
	for (const config of configs)
	{
		user_host = config.user.host;
		user_begin_at = config.user.begin_at;
		describe(`when the user is logged ${config.message}`, () => {
		
			test('should get the guild from discord cache', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);

				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockDiscordClient.guilds.cache.get.mock.calls[index]).toEqual([guild.id]);
				});
			});
		
			test('should continue if the guild does not exist', async () => {
				mockDiscordClient.guilds.cache.get.mockReset();
				mockDiscordClient.guilds.cache.get = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});
	
			test('should get the member from the guild', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockGetCachedGuild.members.fetch).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockGetCachedGuild.members.fetch.mock.calls[index]).toEqual([guild.discord_id]);
				});
			});

			test('should continue if the member does not exist', async () => {
				mockGetCachedGuild.members.fetch.mockReset();
				mockGetCachedGuild.members.fetch = jest.fn().mockRejectedValue('error');
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});

			test('should fetch the guild data from the database', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				for (const user_guild of user_guilds) {
					expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(user_guild.guild_id, mockDiscordClient.application.id);
				}
			});

			test('should find the role from the guild', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockGetGuildMembers.guild.roles.cache.find).toHaveBeenCalledTimes(5);
			});

			test('should continue if the role was not found', async () => {
				mockGetGuildMembers.guild.roles.cache.find.mockReset();
				mockGetGuildMembers.guild.roles.cache.find = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockGetGuildMembers.guild.roles.cache.find).toHaveBeenCalledTimes(5);
			});
	
			test('should update the role', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				if (config.location) expect(mockGetGuildMembers.roles.add).toHaveBeenCalledTimes(5);
				else expect(mockGetGuildMembers.roles.remove).toHaveBeenCalledTimes(5);
			});

		});
	}

});
