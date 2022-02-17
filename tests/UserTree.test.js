const { faker } = require('@faker-js/faker');
const User = require('../src/User');
const UserTree = require('../src/UserTree.js');

const ft_login = 'norminet';

let mockGuild;
const client_id = faker.datatype.number();
let mockDiscord;
let users;
let mockSupabase;
beforeEach(() => {
	mockGuild = {
		members: {
			fetch: jest.fn().mockResolvedValue()
		}
	};
	mockDiscord = {
		application: {
			id: client_id
		},
		guilds: {
			cache: {
				get: jest.fn().mockReturnValue(mockGuild)
			}
		}
	};
	users = new UserTree(mockDiscord);
	mockSupabase = {
		fetchUser: jest.fn().mockResolvedValue([{
			discord_id: '123456789',
			ft_login: ft_login,
			guild_id: '987654321'
		}])
	};
});

describe('findWithDb', () => {

	test('should try to find the user in the tree', async () => {
		users.find = jest.fn().mockReturnValue({});
		await users.findWithDb(ft_login, mockSupabase);
		expect(users.find).toHaveBeenCalledTimes(1);
		expect(users.find).toHaveBeenCalledWith(ft_login);
	});

	test('should fetch the user from the database', async () => {
		await users.findWithDb(ft_login, mockSupabase);
		expect(mockSupabase.fetchUser).toHaveBeenCalledTimes(1);
		expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ ft_login, client_id });
	});

	test('should insert the new user in the tree', async () => {
		await users.findWithDb(ft_login, mockSupabase);
		expect(users.find(ft_login)).toBeTruthy();
	});

	test('should return the new user', async () => {
		const response = await users.findWithDb(ft_login, mockSupabase);
		expect(response).toBeInstanceOf(User);
		expect(response).toHaveProperty('ft_login', ft_login);
	});

});
