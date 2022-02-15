const { faker } = require('@faker-js/faker');
const initUsersMap = require('../src/initUsersMap.js');

const discord_id = faker.datatype.number();
const ft_login = faker.internet.userName();
const guild_id = faker.datatype.number();
let users_map = [];
for (let i = 0; i < 5; i++) {
	users_map.push({
		login: faker.internet.userName(),
		host: faker.internet.ip(),
		begin_at: faker.date.recent()
	});
}
let mockDiscordClient;
let mockSupabase;
let mockFtApi;
let mockUserUpdateRole;
let mockUsers;
beforeEach(() => {
	mockDiscordClient = {
		guilds: {
			cache: {
				get: jest.fn().mockResolvedValue(undefined)
			}
		}
	};
	mockSupabase = {
		fetchUser: jest.fn().mockResolvedValue({ discord_id, ft_login, guild_id }),
		fetchGuild: jest.fn().mockResolvedValue()
	};
	mockFtApi = {
		getUsersMap: jest.fn().mockResolvedValue([])
	};
	mockUserUpdateRole = jest.fn()
	mockUsers = {
		findWithDb: jest.fn().mockResolvedValue({
			ft_login,
			host: null,
			begin_at: null,
			updateRole: mockUserUpdateRole
		})
	};
});

test('should fetch the current users map', async () => {
	await initUsersMap(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
	expect(mockFtApi.getUsersMap).toHaveBeenCalledTimes(1);
});

test('should fetch the user from the binary tree', async () => {
	mockFtApi.getUsersMap.mockClear();
	mockFtApi.getUsersMap.mockResolvedValueOnce(users_map);
	await initUsersMap(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)
	for (const user of users_map) {
		expect(mockUsers.findWithDb).toHaveBeenCalledWith(user.login, mockSupabase);
	}
});

test('should update each user role', async () => {
	mockFtApi.getUsersMap.mockClear();
	mockFtApi.getUsersMap.mockResolvedValueOnce(users_map);
	await initUsersMap(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
	for (const user of users_map) {
		expect(mockUserUpdateRole).toHaveBeenCalledWith(mockSupabase, mockDiscordClient);
	}
});
