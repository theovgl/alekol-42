const initUsersMap = require('../src/initUsersMap.js');

const discord_id = '123abc';
const ft_id = 'ghi456';
const ft_login = 'norminet';
const guild_id = 'tuv345';
let mockSupabase;
const mockGetUsersMap = jest.fn().mockResolvedValue([]);
const mockDiscordClient = {
	guilds: {
		cache: {
			get: jest.fn().mockResolvedValue(undefined)
		}
	}
};
let users;

beforeEach(() => {
	mockSupabase = {
		fetchUser: jest.fn().mockResolvedValue({ discord_id, ft_id, ft_login, guild_id }),
		fetchGuild: jest.fn().mockResolvedValue()
	};
	mockGetUsersMap.mockClear();
	mockDiscordClient.guilds.cache.get.mockClear();
	users = undefined;
});

test('should fetch the current users map', async () => {
	await initUsersMap(mockSupabase, { getUsersMap: mockGetUsersMap }, mockDiscordClient, users);
	expect(mockGetUsersMap).toHaveBeenCalledTimes(1);
});

test('should not crash if users map is empty', async () => {
	expect(async () => await initUsersMap(mockSupabase, { getUsersMap: mockGetUsersMap }, mockDiscordClient, users)).resolves;
});

test('should not crash if request fails', async () => {
	mockGetUsersMap.mockRejectedValueOnce('error');
	expect(async () => await initUsersMap(mockSupabase, { getUsersMap: mockGetUsersMap }, mockDiscordClient, users)).resolves;
});

describe('should fetch an user', () => {

	test('for each row in the users map', async () => {
		mockGetUsersMap.mockReset();
		mockGetUsersMap.mockResolvedValueOnce([
			{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
			{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
			{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
			{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
			{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
		]);
		users = {
			find: jest.fn().mockReturnValue({ data: { updateRole: jest.fn() } }),
			insertFromDb: jest.fn()
		};
		await initUsersMap(mockSupabase, { getUsersMap: mockGetUsersMap }, mockDiscordClient, users)
		expect(users.find).toHaveBeenCalledTimes(5);
	});

});

test('should update each user role', async () => {
	const locations = [
		{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' },
		{ login: 'minetnot', host: 'e2r3p1', begin_at: '1971-01-01 00:00:00 UTC' },
		{ login: 'netnormi', host: 'e3r1p2', begin_at: '1972-01-01 00:00:00 UTC' },
		{ login: 'minetnot', host: 'e2r3p1', begin_at: '1971-01-01 00:00:00 UTC' },
		{ login: 'norminet', host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' }];
	mockGetUsersMap.mockReset();
	mockGetUsersMap.mockResolvedValueOnce(locations);
	const mockUserUpdateRole = jest.fn();
	users = {
		find: jest.fn().mockReturnValue({ data: { updateRole: mockUserUpdateRole } }),
		insertFromDb: jest.fn()
	};
	await initUsersMap(mockSupabase, { getUsersMap: mockGetUsersMap }, mockDiscordClient, users)
	expect(mockUserUpdateRole).toHaveBeenCalledTimes(5);
	locations.forEach((location, index) => {
		expect(mockUserUpdateRole.mock.calls[index]).toEqual([mockSupabase, mockDiscordClient, { host: location.host, begin_at: location.begin_at }]);
	});
});
