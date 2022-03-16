const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const initApp = require('../app.js');

jest.mock('../src/logs.js');
const { logAction } = require('../src/logs.js');

const code = faker.datatype.number().toString();
const state = faker.datatype.number().toString();
const guild_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const ft_login = faker.internet.userName();
const application_id = faker.datatype.number().toString();
let mockGuildMember;
let mockCachedGuild;
let mockDiscordClient;
let mockStateData;
let mockSupabase;
let mockFtUser;
let mockFtApi;
let mockUser;
let mockUsers;
let app;
let response;

describe('sending a wrong state', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockDiscordClient = {};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(null),
		};
		mockFtApi = {};
		mockUser = {};
		mockUsers = {};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'This requests seems forged...');
		expect(console.error).toHaveBeenCalledWith({ message: 'This requests seems forged...', code: '400' });
	});

	test('should send status code 400', () => {
		expect(response.statusCode).toBe(400);
	});

	test('should contain an error message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('This requests seems forged...'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the ft_api.fetchMe request fails', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockDiscordClient = {};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(true),
		};
		mockFtApi = {
			fetchMe: jest.fn().mockRejectedValue(),
		};
		mockUser = {};
		mockUsers = {};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'This requests seems forged...');
		expect(console.error).toHaveBeenCalledWith({ message: 'This requests seems forged...', code: '400' });
	});

	test('should send status code 400', () => {
		expect(response.statusCode).toBe(400);
	});

	test('should contain an error message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('This requests seems forged...'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the user is already registered', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockDiscordClient = {};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			userExists: jest.fn().mockResolvedValue(true),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {};
		mockUsers = {};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'You are already registered');
		expect(console.error).toHaveBeenCalledWith({ message: 'You are already registered', code: '200' });
	});

	test('should send status code 200', () => {
		expect(response.statusCode).toBe(200);
	});

	test('should contain a message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('You are already registered'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the user insertion fails', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockDiscordClient = {
			application: {
				id: application_id,
			},
		};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			insertUser: jest.fn().mockRejectedValue(),
			userExists: jest.fn().mockResolvedValue(false),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {};
		mockUsers = {};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'An unknown error occured');
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	test('should send status code 500', () => {
		expect(response.statusCode).toBe(500);
	});

	test('should contain an error message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('An unknown error occured'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the user is not in the binary tree', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockDiscordClient = {
			application: {
				id: application_id,
			},
		};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			insertUser: jest.fn().mockResolvedValue(),
			userExists: jest.fn().mockResolvedValue(false),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {};
		mockUsers = {
			find: jest.fn().mockReturnValue(null),
		};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should send status code 200', () => {
		expect(response.statusCode).toBe(200);
	});

	test('should contain a message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('Succesful registration'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the member\'s fetch fails', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockCachedGuild = {
			members: {
				fetch: jest.fn().mockRejectedValue(),
			},
		};
		mockDiscordClient = {
			application: {
				id: application_id,
			},
			guilds: {
				cache: {
					get: jest.fn().mockReturnValue(mockCachedGuild),
				},
			},
		};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			insertUser: jest.fn().mockResolvedValue(),
			userExists: jest.fn().mockResolvedValue(false),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {
			guilds_member: [],
		};
		mockUsers = {
			find: jest.fn().mockReturnValue({ data: mockUser }),
		};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'An unknown error occured');
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	test('should send status code 500', () => {
		expect(response.statusCode).toBe(500);
	});

	test('should contain an error message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('An unknown error occured'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('when the role update fails', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockGuildMember = {
			id: discord_id,
		};
		mockCachedGuild = {
			members: {
				fetch: jest.fn().mockResolvedValue(mockGuildMember),
			},
		};
		mockDiscordClient = {
			application: {
				id: application_id,
			},
			guilds: {
				cache: {
					get: jest.fn().mockReturnValue(mockCachedGuild),
				},
			},
		};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			insertUser: jest.fn().mockResolvedValue(),
			userExists: jest.fn().mockResolvedValue(false),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {
			guilds_member: [],
			updateRole: jest.fn().mockRejectedValue(),
		};
		mockUsers = {
			find: jest.fn().mockReturnValue({ data: mockUser }),
		};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should log an error message', () => {
		expect(logAction).toHaveBeenCalledWith(console.error, 'An unknown error occured');
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	test('should send status code 500', () => {
		expect(response.statusCode).toBe(500);
	});

	test('should contain an error message', () => {
		expect(response.res.text).toEqual(expect.stringContaining('An unknown error occured'));
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});

describe('sending a valid request', () => {

	beforeAll(async () => {
		logAction.mockClear();
		console.error = jest.fn();
		mockGuildMember = {
			id: discord_id,
		};
		mockCachedGuild = {
			members: {
				fetch: jest.fn().mockResolvedValue(mockGuildMember),
			},
		};
		mockDiscordClient = {
			application: {
				id: application_id,
			},
			guilds: {
				cache: {
					get: jest.fn().mockReturnValue(mockCachedGuild),
				},
			},
		};
		mockStateData = {
			discord_id,
			guild_id,
		};
		mockSupabase = {
			fetchState: jest.fn().mockResolvedValue(mockStateData),
			insertUser: jest.fn().mockResolvedValue(),
			userExists: jest.fn().mockResolvedValue(false),
		};
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi = {
			fetchMe: jest.fn().mockResolvedValue(mockFtUser),
		};
		mockUser = {
			guilds_member: [],
			updateRole: jest.fn().mockRejectedValue(),
		};
		mockUsers = {
			find: jest.fn().mockReturnValue({ data: mockUser }),
		};
		app = initApp(mockSupabase, mockFtApi, mockDiscordClient, mockUsers);
		response = await supertest(app).get(`/?state=${state}&code=${code}`);
	});

	test('should fetch the state from the database', () => {
		expect(mockSupabase.fetchState).toHaveBeenCalledWith(state);
	});

	test('should fetch the user using the code', () => {
		expect(mockFtApi.fetchMe).toHaveBeenCalledWith(code);
	});

	test('should check that the user is not already registered', () => {
		expect(mockSupabase.userExists).toHaveBeenCalledWith(discord_id, ft_login, guild_id);
	});

	test('should register the user in the database', () => {
		expect(mockSupabase.insertUser).toHaveBeenCalledWith(discord_id, ft_login, guild_id, application_id);
	});

	test('should fetch an user from the tree', () => {
		expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
	});

	test('should update the user\'s role', () => {
		expect(mockUser.updateRole).toHaveBeenCalledTimes(1);
	});

	test('should respond with an HTML file', () => {
		expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
	});

});
