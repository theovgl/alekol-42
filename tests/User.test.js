const { faker } = require('@faker-js/faker');
const User = require('../src/User.js');

global.console = {
	log: jest.fn(),
	error: jest.fn()
};

const ft_id = faker.datatype.number().toString();
const ft_login = faker.internet.userName();
let user_guilds = [];
for (let i = 0; i < 5; i++) {
	user_guilds.push({
		guild_id: faker.datatype.number().toString(),
		discord_id: faker.datatype.number().toString()
	});
}
let user;
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
	user = new User(ft_id, ft_login, user_guilds);
	mockGetGuildMembers = {
		roles: {
			add: jest.fn(),
			remove: jest.fn()
		}
	};
	mockGetCachedGuild = {
		members: {
			fetch: jest.fn().mockResolvedValue(mockGetGuildMembers)
		},
		roles: {
			cache: {
				find: jest.fn().mockReturnValue({})
			}
		}
	};
	mockDiscordClient = {
		isReady: jest.fn().mockReturnValue(true),
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
		{ message: 'in', location: { host: faker.internet.ip(), begin_at: faker.date.recent() } },
		{ message: 'out', location: null }
	];
	for (const config of configs)
	{
		describe(`when the user is logged ${config.message}`, () => {
		
			test('should get the guild from discord cache', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockDiscordClient.guilds.cache.get.mock.calls[index]).toEqual([guild.id]);
				});
			});
		
			test('should continue if the guild does not exist', async () => {
				mockDiscordClient.guilds.cache.get.mockReset();
				mockDiscordClient.guilds.cache.get = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});
	
			test('should get the member from the guild', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockGetCachedGuild.members.fetch).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockGetCachedGuild.members.fetch.mock.calls[index]).toEqual([guild.discord_id]);
				});
			});
	
			test('should continue if the member does not exist', async () => {
				mockGetCachedGuild.members.fetch.mockReset();
				mockGetCachedGuild.members.fetch = jest.fn().mockRejectedValue('error');
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});

			test('should fetch the guild data from the database', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				for (const user_guild of user_guilds) {
					expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(user_guild.guild_id, mockDiscordClient.application.id);
				}
			});
	
			test('should find the role from the guild', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockGetCachedGuild.roles.cache.find).toHaveBeenCalledTimes(5);
			});
	
			test('should continue if the role was not found', async () => {
				mockGetCachedGuild.roles.cache.find.mockReset();
				mockGetCachedGuild.roles.cache.find = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(mockGetCachedGuild.roles.cache.find).toHaveBeenCalledTimes(5);
			});
		
			test('should update the role', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				if (config.location) expect(mockGetGuildMembers.roles.add).toHaveBeenCalledTimes(5);
				else expect(mockGetGuildMembers.roles.remove).toHaveBeenCalledTimes(5);
			});
	
			test('should update the host', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(user.host).toBe(config.location?.host);
			});
	
			test('should update the begin_at', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient, config.location);
				expect(user.begin_at).toBe(config.location?.begin_at);
			});
		
		});
	}

});
