const User = require('../src/User.js');

let user;
let mockGetGuildMembers;
let mockGetCachedGuild;
let mockClient;

console.log = jest.fn();
console.error = jest.fn();

beforeEach(() => {
	user = new User('12345', 'norminet', [
		{ guild_id: '00', discord_id: '01' },
		{ guild_id: '10', discord_id: '11' },
		{ guild_id: '20', discord_id: '21' },
		{ guild_id: '30', discord_id: '31' },
		{ guild_id: '40', discord_id: '41' }
	]);
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
	mockClient = {
		guilds: {
			cache: {
				get: jest.fn().mockReturnValue(mockGetCachedGuild)
			}
		}
	};
});

afterEach(() => {
	mockClient.guilds.cache.get.mockReset();
	mockGetCachedGuild.members.fetch.mockReset();
});

describe('updateRole', () => {

	const configs = [
		{ message: 'in', location: { host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' } },
		{ message: 'out', location: null }
	];
	for (const config of configs)
	{
		describe(`when the user is logged ${config.message}`, () => {
		
			test('should get the guild from discord cache', async () => {
				await user.updateRole(mockClient, config.location);
				expect(mockClient.guilds.cache.get).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockClient.guilds.cache.get.mock.calls[index]).toEqual([guild.id]);
				});
			});
		
			test('should continue if the guild does not exist', async () => {
				mockClient.guilds.cache.get.mockReset();
				mockClient.guilds.cache.get = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockClient, config.location);
				expect(mockClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});
	
			test('should get the member from the guild', async () => {
				await user.updateRole(mockClient, config.location);
				expect(mockGetCachedGuild.members.fetch).toHaveBeenCalledTimes(5);
				user.guilds.forEach((guild, index) => {
					expect(mockGetCachedGuild.members.fetch.mock.calls[index]).toEqual([guild.discord_id]);
				});
			});
	
			test('should continue if the member does not exist', async () => {
				mockGetCachedGuild.members.fetch.mockReset();
				mockGetCachedGuild.members.fetch = jest.fn().mockRejectedValue('error');
				await user.updateRole(mockClient, config.location);
				expect(mockClient.guilds.cache.get).toHaveBeenCalledTimes(5);
			});
	
			test('should find the role from the guild', async () => {
				await user.updateRole(mockClient, config.location);
				expect(mockGetCachedGuild.roles.cache.find).toHaveBeenCalledTimes(5);
			});
	
			test('should continue if the role was not found', async () => {
				mockGetCachedGuild.roles.cache.find.mockReset();
				mockGetCachedGuild.roles.cache.find = jest.fn().mockReturnValue(undefined);
				await user.updateRole(mockClient, config.location);
				expect(mockGetCachedGuild.roles.cache.find).toHaveBeenCalledTimes(5);
			});
		
			test('should update the role', async () => {
				await user.updateRole(mockClient, config.location);
				if (config.location) expect(mockGetGuildMembers.roles.add).toHaveBeenCalledTimes(5);
				else expect(mockGetGuildMembers.roles.remove).toHaveBeenCalledTimes(5);
			});
	
			test('should update the host', async () => {
				await user.updateRole(mockClient, config.location);
				expect(user.host).toBe(config.location?.host);
			});
	
			test('should update the begin_at', async () => {
				await user.updateRole(mockClient, config.location);
				expect(user.begin_at).toBe(config.location?.begin_at);
			});
		
		});
	}

});
