const User = require('../src/User');
const UserTree = require('../src/UserTree.js');

const ft_login = 'norminet';

let users;
let mockSupabase;
beforeEach(() => {
	users = new UserTree();
	mockSupabase = {
		fetchUser: jest.fn().mockResolvedValue([{
			discord_id: '123456789',
			ft_login: ft_login,
			guild_id: '987654321'
		}])
	};
});

describe('insertFromDb', () => {

	test('should fetch the user from the database', async () => {
		await users.insertFromDb(mockSupabase, ft_login);
		expect(mockSupabase.fetchUser).toHaveBeenCalledTimes(1);
		expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ ft_login });
	});

	test('should insert the new user in the tree', async () => {
		await users.insertFromDb(mockSupabase, ft_login);
		expect(users.find(ft_login)).toBeTruthy();
	});

	test('should return the new user', async () => {
		const response = await users.insertFromDb(mockSupabase, ft_login);
		expect(response).toBeInstanceOf(User);
		expect(response).toHaveProperty('ft_login', ft_login);
	});

});
