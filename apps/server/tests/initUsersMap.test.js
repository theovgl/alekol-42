const { faker } = require('@faker-js/faker');
const initUsersMap = require('../src/initUsersMap.js');

jest.mock('../utils/supabase.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../src/logs.js');
const { logUserAction: mockLogUserAction } = require('../src/logs.js');

const users_map = [];
for (let i = 0; i < 5; i++) {
	users_map.push({
		begin_at: faker.date.recent(),
		host: faker.internet.ip(),
		user: {
			login: faker.internet.userName(),
		},
	});
}
let mockUser;

beforeAll(async () => {
	mockFtApi.getUsersLocation.mockResolvedValue(users_map);
	mockUser = {
		updateRole: jest.fn().mockResolvedValue(),
	};
	mockUsers.findWithDb.mockResolvedValue(mockUser);
	await initUsersMap();
});

test('should fetch the current users map', () => {
	expect(mockFtApi.getUsersLocation).toHaveBeenCalledTimes(1);
});

test('should log a message for each user', () => {
	for (const user of users_map) {
		expect(mockLogUserAction).toHaveBeenCalledWith(console.log, user.user.login, 'Is at school');
	}
});

test('should find the user in the binary tree', () => {
	for (const user of users_map) {
		expect(mockUsers.findWithDb).toHaveBeenCalledWith(user.user.login);
	}
});

test('should update each user role', () => {
	expect(mockUser.updateRole).toHaveBeenCalledTimes(5);
});
