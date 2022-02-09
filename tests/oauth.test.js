const supertest = require('supertest');
const app = require('../app.js');
// find the errors that the API throws

const code = '123abc';
const state = 'hij567';
const guild_id = 'qrs345';
const discord_id = '890fgh';
const ft_login = 'norminet';
const ft_id = 'vwx765';
const application_id = '890lmn';
const host = 'e1r2p3';
const begin_at = '1970-01-01 00:00:00 UTC';
const end_at = null;
let mockFtApi;
let mockSupabase;
let mockDiscordClient;
let mockUserUpdateRole;
let mockUsers;
beforeEach(() => {
	mockFtApi = {
		fetchMe: jest.fn().mockResolvedValue({id: ft_id, login: ft_login}),
		fetchUserLocationsByLogin: jest.fn().mockResolvedValue([{login: ft_login, host, begin_at, end_at }])
	};
	mockSupabase = {
		fetchState: jest.fn().mockResolvedValue({ guild_id, discord_id }),
		userExists: jest.fn().mockResolvedValue(false),
		insertUser: jest.fn().mockResolvedValue()
	};
	mockDiscordClient = {
		isReady: jest.fn().mockReturnValue(true),
		application: {
			id: application_id
		}
	};
	mockUserUpdateRole = jest.fn();
	mockUsers = {
		find: jest.fn().mockReturnValue({ data: { updateRole: mockUserUpdateRole } }),
		insertFromDb: jest.fn().mockResolvedValue({ updateRole: mockUserUpdateRole })
	};
});

test('should wait until the client is ready', async () => {
	mockDiscordClient.isReady.mockClear();
	mockDiscordClient.isReady.mockReturnValueOnce(false);
	mockDiscordClient.isReady.mockReturnValueOnce(false);
	mockDiscordClient.isReady.mockReturnValueOnce(true);
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockDiscordClient.isReady).toHaveBeenCalledTimes(3);
});

test('should fetch the state from the database', async () => {
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockSupabase.fetchState).toHaveBeenCalledWith(state);
});

test('should not accept an invalid state', async () => {
	mockSupabase.fetchState.mockClear();
	mockSupabase.fetchState.mockResolvedValue(null);
	const response = await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(response.statusCode).toBe(400);
});

test('should get the user from the 42 api', async () => {
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockFtApi.fetchMe).toHaveBeenCalledWith(code);
});

test('should check that the user is not already registered', async () => {
	mockSupabase.userExists.mockClear();
	mockSupabase.userExists.mockResolvedValue(true);
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockSupabase.userExists).toHaveBeenCalledTimes(1);
});

test('should register the user in the database', async () => {
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockSupabase.insertUser).toHaveBeenCalledWith(discord_id, ft_login, ft_id, guild_id, application_id);
});

test('should get the user\'s location from the 42 api', async () => {
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockFtApi.fetchUserLocationsByLogin).toHaveBeenCalledWith(ft_login);
});

test('should not crash if the user never logged in', async () => {
	mockFtApi.fetchUserLocationsByLogin.mockClear();
	mockFtApi.fetchUserLocationsByLogin.mockResolvedValue([]);
	const response = await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(response.statusCode).toBe(200);
});

test('should fetch an user from the tree', async () => {
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
});

test('should create the user in the tree if it does not exist', async () => {
	mockUsers.find.mockClear();
	mockUsers.find.mockReturnValue(null);
	await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
	expect(mockUsers.insertFromDb).toHaveBeenCalledWith(mockSupabase, ft_login);
});

describe('should update the user\'s role', () => {

	test('if at school', async () => {
		await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
		expect(mockUserUpdateRole).toHaveBeenCalledWith(mockSupabase, mockDiscordClient, { host, begin_at });
	});

	test('if not at school', async () => {
		mockFtApi.fetchUserLocationsByLogin.mockClear();
		mockFtApi.fetchUserLocationsByLogin.mockResolvedValue([{login: ft_login, host, begin_at, end_at: '1970-01-01 12:00:00 UTC' }])
		await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
		expect(mockUserUpdateRole).toHaveBeenCalledWith(mockSupabase, mockDiscordClient, null);
	});

	test('should respond with an HTML file', async () => {
		const response = await supertest(app(mockSupabase, mockFtApi, mockDiscordClient, mockUsers)).get(`/?state=${state}&code=${code}`);
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});
