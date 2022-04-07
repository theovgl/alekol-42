const { faker } = require('@faker-js/faker');
const UserTree = require('../src/UserTree.js');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/logs.js');

const ft_login = faker.internet.userName();
const client_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const guild_id = faker.datatype.number().toString();
let mockUserData;
let mockFetchMember;
let mockGetCachedGuild;
let mockDiscordClient;
let users;
let mockUser;
let ret;

describe('findWithDb', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockUserData = {
			discord_id,
			ft_login,
			guild_id,
		};
		mockSupabase.fetchUser.mockResolvedValue([mockUserData]);
		mockFetchMember = jest.fn().mockResolvedValue();
		mockGetCachedGuild = jest.fn().mockReturnValue({
			members: {
				fetch: mockFetchMember,
			},
		});
		mockDiscordClient = {
			application: {
				id: client_id,
			},
			guilds: {
				cache: {
					get: mockGetCachedGuild,
				},
			},
		};
		users = new UserTree(mockDiscordClient);
		mockUser = faker.datatype.json();
		users.find = jest.fn().mockReturnValue({ data: mockUser });
		users.insert = jest.fn();
	}

	beforeAll(async () => {
		initMocks();
		await users.findWithDb(ft_login);
	});

	test('should try to find the user in the tree', () => {
		expect(users.find).toHaveBeenCalledWith(ft_login);
	});

	describe('when the user is in the tree', () => {

		beforeAll(async () => {
			initMocks();
			ret = await users.findWithDb(ft_login);
		});

		test('should return the user', () => {
			expect(ret).toBe(mockUser);
		});

	});

	describe('when the user is not in the tree', () => {

		describe('and the registration is not in a guild', () => {

			beforeAll(async () => {
				initMocks();
				mockSupabase.fetchUser.mockResolvedValue([mockUserData, mockUserData]);
				mockDiscordClient.guilds.cache.get.mockReturnValueOnce(null);
				users.find.mockReturnValue(null);
				ret = await users.findWithDb(ft_login);
			});

			test('should continue', () => {
				expect(mockDiscordClient.guilds.cache.get).toHaveBeenCalledTimes(2);
			});

		});

		describe('and everything is ok', () => {

			beforeAll(async () => {
				initMocks();
				users.find.mockReturnValue(null);
				ret = await users.findWithDb(ft_login);
			});

			test('should fetch the user from the database', () => {
				expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ ft_login });
			});

			test('should insert the new user in the tree', () => {
				expect(users.insert).toHaveBeenCalledWith(ft_login, expect.objectContaining({
					ft_login,
					guilds_member: expect.any(Array),
				}));
			});

			test('should return the new user', () => {
				expect(ret).toMatchObject({
					ft_login,
					guilds_member: expect.any(Array),
				});
			});

		});

	});

});
