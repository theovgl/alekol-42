const { faker } = require('@faker-js/faker');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');

const ft_login = faker.internet.userName();
const guild_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const host = faker.internet.ip();
const begin_at = faker.date.recent();
const client_id = faker.datatype.number().toString();
const redirect_uri = faker.internet.url();
const role_name = faker.name.jobType();
const mockNewRole = faker.datatype.number();
const end_at = faker.date.recent();
let mockInteraction;
let mockUser;
let mockUserLocation;
let mockMemberData;
let mockUserData;
let mockRoleManager;
let mockMember;

const check = require('../commands/check.js');
describe('check', () => {

	describe('when the member is not registered', () => {

		beforeAll(async () => {
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
			mockSupabase.fetchUser.mockResolvedValueOnce([]);
			await check.execute(mockInteraction);
		});

		test('should reply with an error message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🛑 You must be registered to access that information');
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
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
			mockSupabase.fetchUser.mockResolvedValueOnce([mockMemberData]);
			mockUsers.findWithDb.mockReturnValue({
				host,
				begin_at,
			});
			await check.execute(mockInteraction);
		});

		test('should defer the reply', () => {
			expect(mockInteraction.deferReply).toHaveBeenCalledTimes(1);
		});

		test('should fetch the user from the database', () => {
			expect(mockSupabase.fetchUser).toHaveBeenCalledWith({ discord_id, guild_id });
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
			mockSupabase.fetchUser.mockResolvedValueOnce([mockMemberData]);
			mockUsers.findWithDb.mockReturnValue({
				host,
				begin_at,
			});
			await check.execute(mockInteraction);
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
			mockSupabase.fetchUser.mockResolvedValueOnce([mockMemberData]);
			mockUsers.findWithDb.mockReturnValue({
				host: null,
				begin_at: null,
				end_at,
			});
			await check.execute(mockInteraction);
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

			beforeAll(async () => {
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
				mockSupabase.fetchUser.mockResolvedValueOnce([mockMemberData]);
				mockUsers.findWithDb.mockReturnValue({
					host: null,
					begin_at: null,
					end_at: null,
				});
				mockUserLocation = {
					end_at,
				};
				mockFtApi.fetchUserLocationsByLogin.mockResolvedValue([mockUserLocation]);
				await check.execute(mockInteraction);
			});

			test('should fetch the user\'s locations', () => {
				expect(mockFtApi.fetchUserLocationsByLogin).toHaveBeenCalledWith(ft_login);
			});

		});

	});

});

const forget = require('../commands/forget.js');
describe('forget', () => {

	describe('when the user do not want to unregister', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockInteraction = {
				options: {
					getBoolean: jest.fn().mockReturnValue(false),
				},
				deferReply: jest.fn().mockResolvedValue(),
				editReply: jest.fn().mockResolvedValue(),
			};
			await forget.execute(mockInteraction);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('🥰 We would miss you so much! Thanksfully you are staying!');
		});

	});

	describe('when the user is not in the binary tree', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockUser = {
				guilds_member: {
					filter: jest.fn(),
				},
			};
			mockUsers.find.mockReturnValueOnce(null);
			mockUserData = {
				ft_login,
			};
			mockSupabase.deleteUser.mockResolvedValueOnce([mockUserData]);
			mockInteraction = {
				applicationId: client_id,
				guild: {
					id: guild_id,
					roles: {
						cache: {
							find: jest.fn().mockReturnValue({}),
						},
					},
				},
				member: {
					id: discord_id,
					roles: {
						remove: jest.fn().mockResolvedValue(),
					},
				},
				options: {
					getBoolean: jest.fn().mockReturnValue(true),
				},
				deferReply: jest.fn().mockResolvedValue(),
				editReply: jest.fn().mockResolvedValue(),
			};
			await forget.execute(mockInteraction);
		});

		test('should return before filtering their guilds', () => {
			expect(mockUser.guilds_member.filter).toHaveBeenCalledTimes(0);
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockUser = {
				guilds_member: [
					{ guild: { id: guild_id } },
					{ guild: { id: guild_id + '1' } },
				],
			};
			mockUsers.find.mockReturnValueOnce({ data: mockUser });
			mockUserData = {
				ft_login,
			};
			mockSupabase.deleteUser.mockResolvedValueOnce([mockUserData]);
			mockInteraction = {
				applicationId: client_id,
				guild: {
					id: guild_id,
					roles: {
						cache: {
							find: jest.fn().mockReturnValue({}),
						},
					},
				},
				member: {
					id: discord_id,
					roles: {
						remove: jest.fn().mockResolvedValue(),
					},
				},
				options: {
					getBoolean: jest.fn().mockReturnValue(true),
				},
				deferReply: jest.fn().mockResolvedValue(),
				editReply: jest.fn().mockResolvedValue(),
			};
			await forget.execute(mockInteraction);
		});

		test('should defer the reply', () => {
			expect(mockInteraction.deferReply).toHaveBeenCalledTimes(1);
		});

		test('should delete the user from the database', () => {
			expect(mockSupabase.deleteUser).toHaveBeenCalledWith(discord_id, guild_id, client_id);
		});

		test('should get the user from the binary tree', () => {
			expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
		});

		test('should remove the guild corresponding to the id', () => {
			expect(mockUser.guilds_member.length).toBe(1);
		});

		test('should remove the member\'s role', () => {
			expect(mockInteraction.member.roles.remove).toHaveBeenCalledTimes(1);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('You have been unregistered... 💔');
		});

	});

});

const ping = require('../commands/ping.js');
describe('ping', () => {

	beforeAll(async () => {
		mockInteraction = {
			reply: jest.fn(),
		};
		await ping.execute(mockInteraction);
	});

	test('should reply with pong', () => {
		expect(mockInteraction.reply).toHaveBeenCalledWith('Pong !');
	});

});

const register = require('../commands/register.js');
describe('register', () => {

	beforeAll(async () => {
		jest.resetAllMocks();
		mockInteraction = {
			guild: {
				id: guild_id,
			},
			member: {
				id: discord_id,
			},
			deferReply: jest.fn().mockResolvedValue(),
			editReply: jest.fn().mockResolvedValue(),
		};
		process.env.UID_42 = client_id;
		process.env.REDIRECT_URI = redirect_uri;
		await register.execute(mockInteraction);
	});

	test('should defer the reply', () => {
		expect(mockInteraction.deferReply).toHaveBeenCalledTimes(1);
	});

	test('should insert the state\'s data into the database', () => {
		expect(mockSupabase.insertState).toHaveBeenCalledWith(expect.any(String), guild_id, discord_id);
	});

	test('the state should be random', async () => {
		await register.execute(mockInteraction);
		expect(mockSupabase.insertState.mock.calls[1][0]).not.toBe(mockSupabase.insertState.mock.calls[0][0]);
	});

	test('should reply with an embedded message', () => {
		expect(mockInteraction.editReply).toHaveBeenCalledWith({ embeds: expect.any(Array) });
	});

	describe('the embedded message', () => {

		test('URL should contain the client\'s data', () => {
			expect(mockInteraction.editReply.mock.calls[0][0].embeds[0].url).toBe(`https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&state=${mockSupabase.insertState.mock.calls[0][0]}`);
		});

	});

});

const role = require('../commands/role.js');
describe('role', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockMember = {
			roles: {
				add: jest.fn().mockResolvedValue(),
				remove: jest.fn().mockResolvedValue(),
			},
		};
		mockRoleManager = {
			members: [mockMember],
		};
		mockInteraction = {
			applicationId: client_id,
			guild: {
				roles: {
					cache: {
						find: jest.fn().mockReturnValue(mockNewRole)
							.mockReturnValueOnce(mockRoleManager),
					},
					create: jest.fn().mockResolvedValue(),
				},
			},
			guildId: guild_id,
			options: {
				getString: jest.fn().mockReturnValue(role_name),
			},
			deferReply: jest.fn().mockResolvedValue(),
			editReply: jest.fn().mockResolvedValue(),
		};
	}

	describe('when the role does not exist', () => {

		beforeAll(async () => {
			initMocks();
			mockInteraction.guild.roles.cache.find.mockReset()
				.mockReturnValue(null)
				.mockReturnValueOnce(mockRoleManager);
			await role.execute(mockInteraction);
		});

		test('should create the role', () => {
			expect(mockInteraction.guild.roles.create).toHaveBeenCalledWith({ name: role_name });
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			await role.execute(mockInteraction);
		});

		test('should fetch the guild\'s old data', () => {
			expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(guild_id, client_id);
		});

		test('should set the guild\'s new role', () => {
			expect(mockSupabase.setGuildRole).toHaveBeenCalledWith(guild_id, client_id, role_name);
		});

		test('should get the old and new role from the cache', () => {
			expect(mockInteraction.guild.roles.cache.find).toHaveBeenCalledTimes(2);
		});

		test('should replace the old role with the new one', () => {
			expect(mockMember.roles.remove).toHaveBeenCalledWith(mockRoleManager);
			expect(mockMember.roles.add).toHaveBeenCalledWith(mockNewRole);
		});

		test('should reply with a message', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('Done!');
		});

	});

});
