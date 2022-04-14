const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const initApp = require('../api');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../utils/discord_api.js');
const mockDiscordApi = require('../utils/discord_api.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../config.js');
const mockConfig = require('../config.js');
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
let mockRequest;
let app;
let response;

mockConfig.discord.client.id = client_id;
mockConfig.redirect_uri = redirect_uri;

describe('GET /register', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockStateData = {
			guild_id,
			state,
			ft_login,
		};
		mockSupabase.fetchState.mockResolvedValue(mockStateData);
		mockFtUser = {
			login: ft_login,
		};
		mockFtApi.fetchMe.mockResolvedValue(mockFtUser);
		mockSupabase.deleteState.mockResolvedValue();
		mockSupabase.updateState.mockResolvedValue();
		mockDiscordUser = {
			id: discord_id,
		};
		mockDiscordApi.fetchMe.mockResolvedValue(mockDiscordUser);
		mockSupabase.userExists.mockResolvedValue(false);
		mockSupabase.insertUser.mockResolvedValue();
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
		mockRequest = {
			state,
			code,
		};
	}

	describe.each([
		{ state },
		{ code },
		{ state, code, foo: 'bar' },
	])('{ code: $code, state: $state, foo: $foo }', (mockCode, mockState, foo) => {

		beforeAll(async () => {
			app = initApp(mockDiscordClient);
			mockRequest = { mockCode, mockState, foo };
			response = await supertest(app).post('/register').send(mockRequest);
		});

		test('should log an error message', () => {
			expect(console.error).toHaveBeenCalledWith(expect.any(Error));
		});

		test('should send status code 400', () => {
			expect(response.statusCode).toBe(400);
		});

		test('should allow cors', () => {
			expect(response.headers['access-control-allow-origin']).toBe('*');
		});

		test('should respond with a JSON object', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
		});

		describe('the JSON object', () => {

			test('should contain a message', () => {
				expect(response.body).toHaveProperty('message', 'The request is incorrect...');
			});

			test('should contain details', () => {
				expect(response.body).toHaveProperty('details', expect.any(String));
			});

		});
	});

	describe('when the state fetch fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchState.mockRejectedValue(mockError);
			app = initApp(mockDiscordClient);
			response = await supertest(app).post('/register').send(mockRequest);
		});

		test('should log an error message', () => {
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should allow cors', () => {
			expect(response.headers['access-control-allow-origin']).toBe('*');
		});

		test('should respond with a JSON object', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
		});

		describe('the JSON object', () => {

			test('should contain a message', () => {
				expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
			});

			test('should contain details', () => {
				expect(response.body).toHaveProperty('details', expect.any(String));
			});

		});

	});

	describe('sending a wrong state', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchState.mockResolvedValue(null);
			app = initApp(mockDiscordClient);
			response = await supertest(app).post('/register').send(mockRequest);
		});

		test('should log an error message', () => {
			expect(console.error).toHaveBeenCalledWith(expect.any(Error));
		});

		test('should send status code 400', () => {
			expect(response.statusCode).toBe(400);
		});

		test('should allow cors', () => {
			expect(response.headers['access-control-allow-origin']).toBe('*');
		});

		test('should respond with a JSON object', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
		});

		describe('the JSON object', () => {

			test('should contain a message', () => {
				expect(response.body).toHaveProperty('message', 'The request is incorrect...');
			});

			test('should contain details', () => {
				expect(response.body).toHaveProperty('details', 'The state was not found in the database.');
			});

		});

	});

	describe('when the ft_login has not been set yet', () => {

		describe('when the 42 API fetchMe request fails', () => {

			describe('and the state deletion fails', () => {

				beforeAll(async () => {
					initMocks();
					mockStateData.ft_login = null;
					mockSupabase.fetchState.mockResolvedValue(mockStateData);
					mockFtApi.fetchMe.mockRejectedValue(mockError);
					mockSupabase.deleteState.mockRejectedValue(mockError);
					app = initApp(mockDiscordClient);
					response = await supertest(app).post('/register').send(mockRequest);
				});

				test('should log an error message', () => {
					expect(console.error).toHaveBeenCalledWith(mockError);
				});

				test('should send status code 500', () => {
					expect(response.statusCode).toBe(500);
				});

				test('should allow cors', () => {
					expect(response.headers['access-control-allow-origin']).toBe('*');
				});

				test('should respond with a JSON object', () => {
					expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
				});

				describe('the JSON object', () => {

					test('should contain a message', () => {
						expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
					});

					test('should contain details', () => {
						expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
					});

				});

			});

			describe('and everything is ok', () => {

				beforeAll(async () => {
					initMocks();
					mockStateData.ft_login = null;
					mockSupabase.fetchState.mockResolvedValue(mockStateData);
					mockFtApi.fetchMe.mockRejectedValue(mockError);
					app = initApp(mockDiscordClient);
					response = await supertest(app).post('/register').send(mockRequest);
				});

				test('should delete the state from the database', () => {
					expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
				});

				test('should log an error message', () => {
					expect(console.error).toHaveBeenCalledWith(mockError);
				});

				test('should send status code 400', () => {
					expect(response.statusCode).toBe(400);
				});

				test('should allow cors', () => {
					expect(response.headers['access-control-allow-origin']).toBe('*');
				});

				test('should respond with a JSON object', () => {
					expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
				});

				describe('the JSON object', () => {

					test('should contain a message', () => {
						expect(response.body).toHaveProperty('message', 'The request is incorrect...');
					});

					test('should contain details', () => {
						expect(response.body).toHaveProperty('details', 'The given code does not allow to fetch the user\'s data.');
					});

				});

			});

		});

		describe('when the state update fails', () => {

			beforeAll(async () => {
				initMocks();
				mockStateData.ft_login = null;
				mockSupabase.fetchState.mockResolvedValue(mockStateData);
				mockSupabase.updateState.mockRejectedValueOnce(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('sending a valid request', () => {

			beforeAll(async () => {
				initMocks();
				mockStateData.ft_login = null;
				mockSupabase.fetchState.mockResolvedValue(mockStateData);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should fetch the state from the database', () => {
				expect(mockSupabase.fetchState).toHaveBeenCalledWith(state);
			});

			test('should fetch the 42 user', () => {
				expect(mockFtApi.fetchMe).toHaveBeenCalledWith(code);
			});

			test('should update the state in the database', () => {
				expect(mockSupabase.updateState).toHaveBeenCalledWith(state, { ft_login });
			});

			test('should send status code 200', () => {
				expect(response.statusCode).toBe(200);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain an user', () => {
					expect(response.body).toHaveProperty('user', expect.any(Object));
					expect(response.body.user).toHaveProperty('guild_id', guild_id);
					expect(response.body.user).toHaveProperty('ft_login', ft_login);
				});

				test('should contain the next steps', () => {
					expect(response.body).toHaveProperty('next', expect.any(Object));
					expect(response.body.next).toHaveProperty('service', 'Discord');
					expect(response.body.next).toHaveProperty('location', `https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri + '/register')}&response_type=code&scope=identify&state=${state}`);
				});

			});

		});

	});

	describe('when the ft_login has been set', () => {

		describe('and the Discord API fetchMe request fails', () => {

			describe('and the state deletion fails', () => {

				beforeAll(async () => {
					initMocks();
					mockDiscordApi.fetchMe.mockRejectedValue(mockError);
					mockSupabase.deleteState.mockRejectedValue(mockError);
					app = initApp(mockDiscordClient);
					response = await supertest(app).post('/register').send(mockRequest);
				});

				test('should log an error message', () => {
					expect(console.error).toHaveBeenCalledWith(mockError);
				});

				test('should send status code 500', () => {
					expect(response.statusCode).toBe(500);
				});

				test('should allow cors', () => {
					expect(response.headers['access-control-allow-origin']).toBe('*');
				});

				test('should respond with a JSON object', () => {
					expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
				});

				describe('the JSON object', () => {

					test('should contain a message', () => {
						expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
					});

					test('should contain details', () => {
						expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
					});

				});

			});

			describe('and everything is ok', () => {

				beforeAll(async () => {
					initMocks();
					mockDiscordApi.fetchMe.mockRejectedValue(mockError);
					app = initApp(mockDiscordClient);
					response = await supertest(app).post('/register').send(mockRequest);
				});

				test('should delete the state from the database', () => {
					expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
				});

				test('should log an error message', () => {
					expect(console.error).toHaveBeenCalledWith(mockError);
				});

				test('should send status code 400', () => {
					expect(response.statusCode).toBe(400);
				});

				test('should allow cors', () => {
					expect(response.headers['access-control-allow-origin']).toBe('*');
				});

				test('should respond with a JSON object', () => {
					expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
				});

				describe('the JSON object', () => {

					test('should contain a message', () => {
						expect(response.body).toHaveProperty('message', 'The request is incorrect...');
					});

					test('should contain details', () => {
						expect(response.body).toHaveProperty('details', 'The given code does not allow to fetch the user\'s data.');
					});

				});

			});

		});

		describe('when the state deletion fails', () => {

			beforeAll(async () => {
				initMocks();
				mockSupabase.deleteState.mockRejectedValue(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('and the user_exists check fails', () => {

			beforeAll(async () => {
				initMocks();
				mockSupabase.userExists.mockRejectedValue(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('when the user is already registered', () => {

			beforeAll(async () => {
				initMocks();
				mockSupabase.userExists.mockResolvedValue(true);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should not insert the user', () => {
				expect(mockSupabase.insertUser).not.toHaveBeenCalled();
			});

			test('should send status code 200', () => {
				expect(response.statusCode).toBe(200);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain an user', () => {
					expect(response.body).toHaveProperty('user', expect.any(Object));
					expect(response.body.user).toHaveProperty('guild_id', guild_id);
					expect(response.body.user).toHaveProperty('ft_login', ft_login);
				});

				test('should contain the next steps', () => {
					expect(response.body).toHaveProperty('next', null);
				});

			});

		});

		describe('when the user insertion fails', () => {

			beforeAll(async () => {
				initMocks();
				mockSupabase.insertUser.mockRejectedValue(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('when the user is not in the binary tree', () => {

			beforeAll(async () => {
				initMocks();
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should send status code 200', () => {
				expect(response.statusCode).toBe(200);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain an user', () => {
					expect(response.body).toHaveProperty('user', expect.any(Object));
					expect(response.body.user).toHaveProperty('guild_id', guild_id);
					expect(response.body.user).toHaveProperty('ft_login', ft_login);
				});

				test('should contain the next steps', () => {
					expect(response.body).toHaveProperty('next', null);
				});

			});

		});

		describe('when the guild was not found', () => {

			beforeAll(async () => {
				initMocks();
				mockDiscordClient.guilds.cache.get.mockReturnValue(null);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should send status code 200', () => {
				expect(response.statusCode).toBe(200);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain an user', () => {
					expect(response.body).toHaveProperty('user', expect.any(Object));
					expect(response.body.user).toHaveProperty('guild_id', guild_id);
					expect(response.body.user).toHaveProperty('ft_login', ft_login);
				});

				test('should contain the next steps', () => {
					expect(response.body).toHaveProperty('next', null);
				});

			});

		});

		describe('when the member\'s fetch fails', () => {

			beforeAll(async () => {
				initMocks();
				mockGuild.members.fetch.mockRejectedValue(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('when the role update fails', () => {

			beforeAll(async () => {
				initMocks();
				mockUser.updateRole.mockRejectedValue(mockError);
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should log an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should send status code 500', () => {
				expect(response.statusCode).toBe(500);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain a message', () => {
					expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
				});

				test('should contain details', () => {
					expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
				});

			});

		});

		describe('sending a valid request', () => {

			beforeAll(async () => {
				initMocks();
				app = initApp(mockDiscordClient);
				response = await supertest(app).post('/register').send(mockRequest);
			});

			test('should fetch the user using the code', () => {
				expect(mockDiscordApi.fetchMe).toHaveBeenCalledWith(code);
			});

			test('should delete the state from the database', () => {
				expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
			});

			test('should check that the user is not already registered', () => {
				expect(mockSupabase.userExists).toHaveBeenCalledWith(discord_id, ft_login, guild_id);
			});

			test('should register the user into the database', () => {
				expect(mockSupabase.insertUser).toHaveBeenCalledWith(discord_id, ft_login, guild_id);
			});

			test('should find an user from the tree', () => {
				expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
			});

			test('should add the member to the user\'s members array', () => {
				expect(mockUser.guilds_member.length).toBe(1);
			});

			test('should update the user\'s role', () => {
				expect(mockUser.updateRole).toHaveBeenCalledTimes(1);
			});

			test('should allow cors', () => {
				expect(response.headers['access-control-allow-origin']).toBe('*');
			});

			test('should respond with a JSON object', () => {
				expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
			});

			describe('the JSON object', () => {

				test('should contain an user', () => {
					expect(response.body).toHaveProperty('user', expect.any(Object));
					expect(response.body.user).toHaveProperty('guild_id', guild_id);
					expect(response.body.user).toHaveProperty('ft_login', ft_login);
				});

				test('should contain the next steps', () => {
					expect(response.body).toHaveProperty('next', null);
				});

			});

		});

	});

});

describe('DELETE /state/:id', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockSupabase.deleteState.mockResolvedValue();
	}

	describe('when the state delete fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteState.mockRejectedValue(mockError);
			response = await supertest(app).delete(`/state/${state}`);
		});

		test('should log an error message', () => {
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should send status code 500', () => {
			expect(response.statusCode).toBe(500);
		});

		test('should allow cors', () => {
			expect(response.headers['access-control-allow-origin']).toBe('*');
		});

		test('should respond with a JSON object', () => {
			expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
		});

		describe('the JSON object', () => {

			test('should contain a message', () => {
				expect(response.body).toHaveProperty('message', 'An unexpected error occured...');
			});

			test('should contain details', () => {
				expect(response.body).toHaveProperty('details', 'Please contact an administrator.');
			});

		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			response = await supertest(app).delete(`/state/${state}`);
		});

		test('should delete the state from the database', () => {
			expect(mockSupabase.deleteState).toHaveBeenCalledWith(state);
		});

		test('should send status code 204', () => {
			expect(response.statusCode).toBe(204);
		});

		test('should allow cors', () => {
			expect(response.headers['access-control-allow-origin']).toBe('*');
		});


	});

});
