const { faker } = require('@faker-js/faker');
const { MessageActionRow } = require('discord.js');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');
jest.mock('../config.js');
const mockConfig = require('../config.js');
jest.mock('../src/logs.js');
const { logAction: mockLogAction } = require('../src/logs.js');
global.console.error = jest.fn();

const ft_login = faker.internet.userName();
const guild_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const host = faker.internet.ip();
const begin_at = faker.date.recent();
const client_id = faker.datatype.number().toString();
const redirect_uri = faker.internet.url();
const role_name = faker.name.jobType();
const role_id = faker.datatype.number().toString();
const end_at = faker.date.recent();
let mockInteraction;
let mockUserLocation;
let mockMemberData;
let mockUserData;
let mockRole;

mockConfig.redirect_uri.ft = redirect_uri;
mockConfig.ft.client.id = client_id;

const auth = require('../commands/auth.js');
describe('auth', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockUserData = {
			guild_id,
		};
		mockSupabase.fetchUser.mockResolvedValue([mockUserData]);
		mockSupabase.insertState.mockResolvedValue();
		mockInteraction = {
			guildId: guild_id,
			user: {
				id: discord_id,
			},
			deferReply: jest.fn().mockResolvedValue(),
			editReply: jest.fn().mockResolvedValue(),
			inGuild: jest.fn().mockReturnValue(true),
		};
	}

	function not_registered_tests() {
		test('should insert a state in the database', () => {
			expect(mockSupabase.insertState).toHaveBeenCalledWith(expect.any(String), guild_id);
		});

		test('the state should be random', async () => {
			await auth.execute(mockInteraction);
			expect(mockSupabase.insertState.mock.calls[0][0]).not.toBe(mockSupabase.insertState.mock.calls[1][0]);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith({ embeds: expect.any(Array), components: expect.any(Array) });
		});

		describe('the message embed', () => {

			test('should contain a description', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].description).toBe('You are not registered');
			});

		});

		describe('the component\'s button', () => {

			test('should be a link', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].style).toBe('LINK');
			});

			test('should link to the intra oauth', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].url).toBe(`https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&state=${mockSupabase.insertState.mock.calls[0][0]}`);
			});

		});
	}

	describe('when the user is not registered in the guild', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchUser.mockResolvedValue([{
				guild_id: guild_id - 1,
			}]);
			await auth.execute(mockInteraction);
		});

		not_registered_tests();

	});

	describe('when the user is not registered anywhere', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchUser.mockResolvedValue([]);
			mockInteraction.inGuild.mockReturnValue(false);
			await auth.execute(mockInteraction);
		});

		not_registered_tests();

	});

	describe('when the user is registered in private messages', () => {

		beforeAll(async () => {
			initMocks();
			mockInteraction.inGuild.mockReturnValue(false);
			await auth.execute(mockInteraction);
		});

		describe('the message embed', () => {

			test('should contain a description', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].description).toBe('You are registered');
			});

		});

		describe('the component\'s button', () => {

			test('should be a danger', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].style).toBe('DANGER');
			});

			test('should have a label', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].label).toBe('Unregister from all guilds');
			});

		});

	});

	describe('when the user is registered in the guild', () => {

		beforeAll(async () => {
			initMocks();
			await auth.execute(mockInteraction);
		});

		describe('the message embed', () => {

			test('should contain a description', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].description).toBe('You are registered');
			});

		});

		describe('the component\'s button', () => {

			test('should be a danger', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].style).toBe('DANGER');
			});

			test('should have a label', () => {
				expect(mockInteraction.editReply.mock.calls[0][0].components[0].components[0].label).toBe('Unregister');
			});

		});

	});

	describe('anytime', () => {

		test('should defer the reply', () => {
			expect(mockInteraction.deferReply).toHaveBeenCalled();
		});

		test('should fetch the user from the database', () => {
			expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ discord_id });
		});

	});

});

const ping = require('../commands/ping.js');
describe('ping', () => {

	beforeAll(async () => {
		jest.resetAllMocks();
		mockInteraction = {
			reply: jest.fn(),
		};
		await ping.execute(mockInteraction);
	});

	test('should reply with pong', () => {
		expect(mockInteraction.reply).toHaveBeenCalledWith('Pong !');
	});

});

const role = require('../commands/role.js');
describe('role', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockRole = {
			label: role_name,
			value: role_id,
		};
		mockInteraction = {
			guild: {
				roles: {
					cache: {
						filter: jest.fn(),
						map: jest.fn().mockReturnValue([mockRole]),
					},
				},
			},
			deferReply: jest.fn().mockResolvedValue(),
			editReply: jest.fn().mockResolvedValue(),
			inGuild: jest.fn().mockReturnValue(true),
			member: {
				permissions: {
					has: jest.fn().mockReturnValue(true),
				},
			},
		};
		mockInteraction.guild.roles.cache.filter.mockReturnValue(mockInteraction.guild.roles.cache);
	}

	describe('when the command was not sent in a guild', () => {

		beforeAll(async () => {
			initMocks();
			mockInteraction.inGuild.mockReturnValue(false);
			await role.execute(mockInteraction);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🚧 This command must be executed in a guild');
		});

	});

	describe('when the user does not have enough permissions', () => {

		beforeAll(async () => {
			initMocks();
			mockInteraction.member.permissions.has.mockReturnValue(false);
			await role.execute(mockInteraction);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🛑 You need \'Manage Server\' permissions to change the role');
		});

	});

	describe('when there are no roles to give', () => {

		beforeAll(async () => {
			initMocks();
			mockInteraction.guild.roles.cache.map.mockReturnValue([]);
			await role.execute(mockInteraction);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🛑 You have no permission on any role');
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			await role.execute(mockInteraction);
		});

		test('should get the roles', () => {
			expect(mockInteraction.guild.roles.cache.filter).toHaveBeenCalled();
			expect(mockInteraction.guild.roles.cache.map).toHaveBeenCalled();
		});

		test('should reply with a message action row', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith({ components: [expect.any(MessageActionRow)] });
			for (const guild_role of mockInteraction.editReply.mock.calls[0][0].components[0].components[0].options) {
				expect(guild_role).toMatchObject({ label: role_name, value: role_id });
			}
		});

	});

});

const spy = require('../commands/spy.js');
describe('spy', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockInteraction = {
			guildId: guild_id,
			options: {
				getString: jest.fn().mockReturnValue(ft_login),
			},
			user: {
				id: discord_id,
			},
			deferReply: jest.fn().mockResolvedValue(),
			editReply: jest.fn().mockResolvedValue(),
		};
		mockMemberData = {
		};
		mockSupabase.fetchUser.mockResolvedValue([mockMemberData]);
		mockUsers.findWithDb.mockReturnValue({
			host,
			begin_at,
			end_at,
		});
	}

	describe('when the member is not registered', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchUser.mockResolvedValueOnce([]);
			await spy.execute(mockInteraction);
		});

		test('should reply with an error message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🛑 You must be registered to access that information');
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			await spy.execute(mockInteraction);
		});

		test('should defer the reply', () => {
			expect(mockInteraction.deferReply).toHaveBeenCalledTimes(1);
		});

		test('should fetch the user from the database', () => {
			expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ discord_id });
		});

		test('should find the user in the binary tree', () => {
			expect(mockUsers.findWithDb).toHaveBeenCalledWith(ft_login);
		});

		test('should reply with an embedded message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith({ embeds: expect.any(Array) });
		});

	});

	describe('when at school', () => {

		beforeAll(async () => {
			initMocks();
			await spy.execute(mockInteraction);
		});

		test('title should be the login', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].title).toBe(ft_login);
		});

		test('description should tell that the user is at school', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].description).toBe('Is at school');
		});

		test('URL should point to the user\'s intra profile', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].url).toBe(`https://profile.intra.42.fr/users/${ft_login}`);
		});

		test('there should be a host field', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].fields).toContainEqual({ name: 'Host', value: host, inline: expect.any(Boolean) });
		});

		test('there should be a logged field', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].fields).toContainEqual({ name: 'Logged', value: expect.any(String), inline: expect.any(Boolean) });
		});

	});

	describe('when not at school', () => {

		beforeAll(async () => {
			initMocks();
			mockUsers.findWithDb.mockReturnValueOnce({
				host: null,
				begin_at: null,
				end_at,
			});
			await spy.execute(mockInteraction);
		});

		test('title should be the login', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].title).toBe(ft_login);
		});

		test('description should tell that the user is not at school', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].description).toBe('Is not at school');
		});

		test('URL should point to the user\'s intra profile', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].url).toBe(`https://profile.intra.42.fr/users/${ft_login}`);
		});

		test('there should be a last seen field', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].fields).toContainEqual({ name: 'Last seen', value: expect.any(String), inline: expect.any(Boolean) });
		});

		describe('and the bot has never seen user logged in', () => {

			describe('and the user does not exist', () => {

				beforeAll(async () => {
					initMocks();
					mockUsers.findWithDb.mockReturnValueOnce({
						host: null,
						begin_at: null,
						end_at: null,
					});
					mockFtApi.fetchUserLocationsByLogin.mockRejectedValueOnce();
					await spy.execute(mockInteraction);
				});

				test('should log an error message', () => {
					expect(mockLogAction).toHaveBeenCalledWith(console.error, `The user ${ft_login} does not exist.`);
				});

				test('should reply with an error message', () => {
					expect(mockInteraction.editReply).toHaveBeenCalledWith(`🙅 The user ${ft_login} does not exist`);
				});

			});

			describe('and the user has never logged in', () => {

				beforeAll(async () => {
					initMocks();
					mockUsers.findWithDb.mockReturnValueOnce({
						host: null,
						begin_at: null,
						end_at: null,
					});
					mockFtApi.fetchUserLocationsByLogin.mockResolvedValueOnce([]);
					await spy.execute(mockInteraction);
				});

				test('should reply with an error message', () => {
					expect(mockInteraction.editReply).toHaveBeenCalledWith(`💤 The user ${ft_login} has never logged in`);
				});

			});

			describe('and everything is ok', () => {

				beforeAll(async () => {
					initMocks();
					mockUsers.findWithDb.mockReturnValueOnce({
						host: null,
						begin_at: null,
						end_at: null,
					});
					mockFtApi.fetchUserLocationsByLogin.mockResolvedValueOnce([mockUserLocation]);
					await spy.execute(mockInteraction);
				});

				test('should fetch the user\'s locations', () => {
					expect(mockFtApi.fetchUserLocationsByLogin).toHaveBeenCalledWith(ft_login);
				});

			});

		});

	});

});
