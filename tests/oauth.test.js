const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const initApp = require('../app.js');

jest.mock('../src/logs.js');
const { logAction } = require('../src/logs.js');
jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../utils/discord_api.js');
const mockDiscordApi = require('../utils/discord_api.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
console.error = jest.fn();

const code = faker.datatype.number().toString();
const state = faker.datatype.number().toString();
const guild_id = faker.datatype.number().toString();
const client_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const ft_login = faker.internet.userName();
const redirect_uri = faker.internet.url();
const mockError = new Error(faker.hacker.phrase());
let mockGuild;
let mockDiscordClient;
let mockStateData;
let mockFtUser;
let mockUser;
let mockDiscordUser;
let app;
let response;

process.env.DISCORD_CLIENT_ID = client_id;
process.env.REDIRECT_URI = redirect_uri;

describe('GET /from_42', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockSupabase.updateState.mockResolvedValue([{}]);
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi.fetchMe.mockResolvedValue(mockFtUser);
		mockUser = {};
		mockDiscordClient = {};
	}

	describe('when the 42 API fetchMe request fails', () => {

		beforeAll(() => {
			initMocks();
			mockFtApi.fetchMe.mockRejectedValue(mockError);
		});

		describe('and the state deletion fails', () => {

			beforeAll(async () => {
				mockSupabase.deleteState.mockRejectedValueOnce(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).get(`/from_42?state=${state}&code=${code}`);
			});

			test('should log an error message', () => {
				expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should contain an error message', () => {
				expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
			});

			test('should respond with an HTML file', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
			});

		});

		describe('and everything is ok', () => {

			beforeAll(async () => {
				app = initApp(mockDiscordClient);
				response = await supertest(app).get(`/from_42?state=${state}&code=${code}`);
			});

			test('should delete the state from the database', () => {
				expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
			});

			test('should log an error message', () => {
				expect(logAction).toHaveBeenCalledWith(console.error, 'This request seems forged...');
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 400', () => {
				expect(response.statusCode).toBe(400);
			});

			test('should contain an error message', () => {
				expect(response.res.text).toEqual(expect.stringContaining('This request seems forged...'));
			});

			test('should respond with an HTML file', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
			});

		});

	});

	describe('when the state update fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.updateState.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_42?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('sending a wrong state', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.updateState.mockResolvedValue([]);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_42?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'This request seems forged...');
			expect(console.error).toHaveBeenCalledWith(expect.any(Error));
		});

		test('should send status code 400', () => {
			expect(response.statusCode).toBe(400);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining('This request seems forged...'));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('sending a valid request', () => {

		beforeAll(async () => {
			initMocks();
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_42?state=${state}&code=${code}`);
		});

		test('should fetch the 42 user', () => {
			expect(mockFtApi.fetchMe).toHaveBeenCalledWith(code);
		});

		test('should update the state in the database', () => {
			expect(mockSupabase.updateState).toHaveBeenCalledWith(state, { ft_login });
		});

		test('should redirect to the Discord api', () => {
			expect(response.statusCode).toBe(302);
			expect(response.headers).toHaveProperty('location', `https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri + '/from_discord')}&response_type=code&scope=identify&state=${state}`);
		});

	});

});

describe('GET /from_discord', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockStateData = {
			ft_login,
			guild_id,
		};
		mockSupabase.deleteState.mockResolvedValue([mockStateData]);
		mockSupabase.insertUser.mockResolvedValue();
		mockSupabase.userExists.mockResolvedValue(false);
		mockDiscordUser = {
			id: discord_id,
		};
		mockDiscordApi.fetchMe.mockResolvedValue(mockDiscordUser);
		mockUser = {
			id: discord_id,
			guilds_member: [],
			updateRole: jest.fn().mockResolvedValue(),
		};
		mockUsers.find.mockReturnValue({ data: mockUser });
		mockGuild = {
			members: {
				fetch: jest.fn().mockResolvedValue({}),
			},
		};
		mockDiscordClient = {
			guilds: {
				cache: {
					get: jest.fn().mockReturnValue(mockGuild),
				},
			},
		};
	}

	describe('when the state deletion fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteState.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('when the Discord API fetchMe request fails', () => {

		beforeAll(async () => {
			initMocks();
			mockDiscordApi.fetchMe.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'This request seems forged...');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 400', () => {
			expect(response.statusCode).toBe(400);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining('This request seems forged...'));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('when the user is already registered', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.userExists.mockResolvedValue(true);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'You are already registered');
			expect(console.error).toHaveBeenCalledWith(expect.any(Error));
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
			initMocks();
			mockSupabase.insertUser.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('when the user is not in the binary tree', () => {

		beforeAll(async () => {
			initMocks();
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should send status code 200', () => {
			expect(response.statusCode).toBe(200);
		});

	});

	describe('when the member\'s fetch fails', () => {

		beforeAll(async () => {
			initMocks();
			mockGuild.members.fetch.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('when the role update fails', () => {

		beforeAll(async () => {
			initMocks();
			mockUser.updateRole.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, mockError.message);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should contain an error message', () => {
			expect(response.res.text).toEqual(expect.stringContaining(mockError.message));
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

	describe('sending a valid request', () => {

		beforeAll(async () => {
			initMocks();
			app = initApp(mockDiscordClient);
			response = await supertest(app).get(`/from_discord?state=${state}&code=${code}`);
		});

		test('should delete the state from the database', () => {
			expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
		});

		test('should fetch the user using the code', () => {
			expect(mockDiscordApi.fetchMe).toHaveBeenCalledWith(code);
		});

		test('should check that the user is not already registered', () => {
			expect(mockSupabase.userExists).toHaveBeenCalledWith(discord_id, ft_login, guild_id);
		});

		test('should register the user into the database', () => {
			expect(mockSupabase.insertUser).toHaveBeenCalledWith(discord_id, ft_login, guild_id);
		});

		test('should fetch an user from the tree', () => {
			expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
		});

		test('should add the member to the user\'s members array', () => {
			expect(mockUser.guilds_member.length).toBe(1);
		});

		test('should update the user\'s role', () => {
			expect(mockUser.updateRole).toHaveBeenCalledTimes(1);
		});

		test('should respond with an HTML file', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('html'));
		});

	});

});
