const { faker } = require('@faker-js/faker');
const {
	onGuildCreate,
	onGuildDelete,
	onGuildMemberAdd,
	onGuildMemberRemove,
	onInteractionCreate,
	onReady,
} = require('../utils/discord.js');

jest.mock('../src/logs.js');
const { logAction } = require('../src/logs.js');
jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../app.js');
const mockInitApp = require('../app.js');
jest.mock('../utils/ft_api.js');
jest.mock('../deploy-commands.js');
const mockDeployCommands = require('../deploy-commands.js');
jest.mock('../src/resetRoles.js');
const mockResetRoles = require('../src/resetRoles.js');
jest.mock('../src/initUsersMap.js');
const mockInitUsersMap = require('../src/initUsersMap.js');
jest.mock('../utils/websocket.js');
const { initWebsocket: mockInitWebsocket } = require('../utils/websocket.js');
jest.mock('../src/ws_healthcheck.js');
const mockWsHealthcheck = require('../src/ws_healthcheck.js');
jest.mock('../utils/ft_api.js');
const mockFtApi = require('../utils/ft_api.js');
console.error = jest.fn();

const guild_id = faker.datatype.number().toString();
const guild_name = faker.company.companyName();
const client_id = faker.datatype.number().toString();
const member_id = faker.datatype.number().toString();
const discord_id = faker.datatype.number().toString();
const ft_login = faker.internet.userName();
const command_name = faker.company.bsBuzz();
const mockError = faker.hacker.phrase();
const location_id = faker.datatype.number();
const DEFAULT_ROLE = 'worker';
let mockGuild;
let mockMember;
let mockUser;
let mockUserData;
let mockInteraction;
let mockCommand;
let mockClient;
let mockApp;
let mockLocation;

describe('onGuildCreate', () => {

	describe('when the guild\'s insertion fails', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				client: {
					application: {
						id: client_id,
					},
				},
				id: guild_id,
				name: guild_name,
			};
			mockSupabase.insertGuild.mockRejectedValueOnce(mockError);
			await onGuildCreate(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while joining the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the role does not already exist', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				client: {
					application: {
						id: client_id,
					},
				},
				id: guild_id,
				name: guild_name,
				roles: {
					cache: {
						find: jest.fn().mockReturnValue(null),
					},
					create: jest.fn().mockResolvedValue(),
				},
			};
			await onGuildCreate(mockGuild);
		});

		test('should create the role', () => {
			expect(mockGuild.roles.create).toHaveBeenCalledWith({ name: DEFAULT_ROLE });
		});

		describe('when the role creation fails', () => {

			beforeAll(async () => {
				jest.resetAllMocks();
				mockGuild = {
					client: {
						application: {
							id: client_id,
						},
					},
					id: guild_id,
					name: guild_name,
					roles: {
						cache: {
							find: jest.fn().mockReturnValue(null),
						},
						create: jest.fn().mockRejectedValue(),
					},
				};
				await onGuildCreate(mockGuild);
			});

			test('should log an error message', () => {
				expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while joining the guild');
			});

		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				client: {
					application: {
						id: client_id,
					},
				},
				id: guild_id,
				name: guild_name,
				roles: {
					cache: {
						find: jest.fn().mockReturnValue({}),
					},
				},
			};
			await onGuildCreate(mockGuild);
		});

		test('should insert the guild into the database', () => {
			expect(mockSupabase.insertGuild).toHaveBeenCalledWith(guild_id, guild_name, client_id);
		});

		test('should check if the guild exists', () => {
			expect(mockGuild.roles.cache.find).toHaveBeenCalled();
		});

		test('should log a message', () => {
			expect(logAction).toHaveBeenCalledWith(console.log, `Joined guild ${mockGuild.name}`);
		});

	});

});

describe('onGuildDelete', () => {

	describe('when the guild\'s users deletion fails', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				id: guild_id,
				name: guild_name,
				applicationId: client_id,
			};
			mockSupabase.deleteGuild.mockResolvedValueOnce();
			mockSupabase.deleteUsersOfGuild.mockRejectedValueOnce(mockError);
			await onGuildDelete(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while leaving the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the guild\'s deletion fails', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				id: guild_id,
				name: guild_name,
				applicationId: client_id,
			};
			mockSupabase.deleteGuild.mockRejectedValueOnce(mockError);
			mockSupabase.deleteUsersOfGuild.mockResolvedValueOnce();
			await onGuildDelete(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while leaving the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the deletions succeed', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockGuild = {
				id: guild_id,
				name: guild_name,
				applicationId: client_id,
			};
			mockSupabase.deleteGuild.mockResolvedValueOnce();
			mockSupabase.deleteUsersOfGuild.mockResolvedValueOnce();
			await onGuildDelete(mockGuild);
		});

		test('should delete the guild\'s users from the database', () => {
			expect(mockSupabase.deleteUsersOfGuild).toHaveBeenCalledWith(guild_id, client_id);
		});

		test('should delete the guild from the database', () => {
			expect(mockSupabase.deleteGuild).toHaveBeenCalledWith(guild_id, client_id);
		});

		test('should log a message', () => {
			expect(logAction).toHaveBeenCalledWith(console.log, `Left guild ${mockGuild.name}`);
		});

	});

});

describe('onGuildMemberAdd', () => {

	describe('when the member\'s fetch fails', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockMember = {
				fetch: jest.fn().mockRejectedValueOnce(mockError),
			};
			await onGuildMemberAdd(mockMember);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while fetching the member');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the member\'s fetch succeeds', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockMember = {
				fetch: jest.fn().mockResolvedValueOnce(),
			};
			await onGuildMemberAdd(mockMember);
		});

		test('should fetch the member from discord', () => {
			expect(mockMember.fetch).toHaveBeenCalledTimes(1);
		});

	});

});

describe('onGuildMemberRemove', () => {

	describe('when the member\'s deletion fails', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockSupabase.deleteUser.mockRejectedValueOnce(mockError);
			mockMember = {
				id: member_id,
				guild: {
					id: guild_id,
				},
			};
			global.application = {
				id: client_id,
			};
			await onGuildMemberRemove(mockMember);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while the member left the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the member was not registered', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockSupabase.deleteUser.mockResolvedValueOnce([]);
			mockMember = {
				id: member_id,
				guild: {
					id: guild_id,
				},
			};
			global.application = {
				id: client_id,
			};
			await onGuildMemberRemove(mockMember);
		});

		test('should return before finding it in the tree', () => {
			expect(mockUsers.find).toHaveBeenCalledTimes(0);
		});

	});

	describe('when the member is not the binary tree', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockUserData = [{
				discord_id,
				ft_login,
				guild_id,
			}];
			mockSupabase.deleteUser.mockResolvedValueOnce(mockUserData);
			mockUser = {
				guilds_member: {
					filter: jest.fn(),
				},
			};
			mockUsers.find.mockReturnValueOnce(null);
			mockMember = {
				id: member_id,
				guild: {
					id: guild_id,
				},
			};
			global.application = {
				id: client_id,
			};
			await onGuildMemberRemove(mockMember);
		});

		test('should return before filtering their guilds', () => {
			expect(mockUser.guilds_member.filter).toHaveBeenCalledTimes(0);
		});

	});

	describe('when the member deletion succeeds', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockUserData = [{
				discord_id,
				ft_login,
				guild_id,
			}];
			mockSupabase.deleteUser.mockResolvedValueOnce(mockUserData);
			mockUser = {
				guilds_member: [
					{ guild: { id: guild_id } },
					{ guild: { id: guild_id + '1' } },
				],
			};
			mockUsers.find.mockReturnValueOnce({ data: mockUser });
			mockMember = {
				id: member_id,
				guild: {
					id: guild_id,
				},
			};
			global.application = {
				id: client_id,
			};
			await onGuildMemberRemove(mockMember);
		});

		test('should delete the member from the database', () => {
			expect(mockSupabase.deleteUser).toHaveBeenCalledWith(member_id, guild_id, client_id);
		});

		test('should find the member in the binary tree', () => {
			expect(mockUsers.find).toHaveBeenCalledWith(ft_login);
		});

		test('should remove the guild corresponding to the id', () => {
			expect(mockUser.guilds_member.length).toBe(1);
		});

	});

});

describe('onInteractionCreate', () => {

	describe('when the interaction is not a command', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockInteraction = {
				commandName: command_name,
				editReply: jest.fn().mockResolvedValue(),
				isCommand: jest.fn().mockReturnValueOnce(false),
			};
			global.commands = {
				get: jest.fn(),
			};
			await onInteractionCreate(mockInteraction);
		});

		test('should return before getting the command from discord', () => {
			expect(global.commands.get).toHaveBeenCalledTimes(0);
		});

	});

	describe('when the command was not found', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockInteraction = {
				commandName: command_name,
				editReply: jest.fn().mockResolvedValue(),
				isCommand: jest.fn().mockReturnValueOnce(true),
			};
			mockCommand = {
				execute: jest.fn(),
			};
			global.commands = {
				get: jest.fn().mockReturnValueOnce(null),
			};
			await onInteractionCreate(mockInteraction);
		});

		test('should return before executing the command', () => {
			expect(mockCommand.execute).toHaveBeenCalledTimes(0);
		});

	});

	describe('when the command fails to execute', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockInteraction = {
				commandName: command_name,
				editReply: jest.fn().mockResolvedValue(),
				isCommand: jest.fn().mockReturnValueOnce(true),
			};
			mockCommand = {
				execute: jest.fn().mockRejectedValueOnce(mockError),
			};
			global.commands = {
				get: jest.fn().mockReturnValueOnce(mockCommand),
			};
			await onInteractionCreate(mockInteraction);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, `An error occured while executing the interaction's command (${mockInteraction.commandName})`);
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should edit the reply', () => {
			expect(mockInteraction.editReply).toHaveBeenCalledWith('😵 An error occurred... Please try again later!');
		});

	});

	describe('when the command executes successfuly', () => {

		beforeAll(async () => {
			jest.resetAllMocks();
			mockInteraction = {
				commandName: command_name,
				editReply: jest.fn().mockResolvedValue(),
				isCommand: jest.fn().mockReturnValueOnce(true),
			};
			mockCommand = {
				execute: jest.fn().mockResolvedValueOnce(),
			};
			global.commands = {
				get: jest.fn().mockReturnValueOnce(mockCommand),
			};
			await onInteractionCreate(mockInteraction);
		});

		test('should get the command from the discord', () => {
			expect(global.commands.get).toHaveBeenCalledWith(command_name);
		});

		test('should execute the command', () => {
			expect(mockCommand.execute).toHaveBeenCalledWith(mockInteraction);
		});

	});

});

describe('onReady', () => {

	beforeAll(async () => {
		jest.resetAllMocks();
		jest.useFakeTimers();
		jest.spyOn(global, 'setInterval');
		mockApp = {
			listen: jest.fn(),
		};
		mockInitApp.mockReturnValue(mockApp);
		mockClient = {
			application: {
				fetch: jest.fn().mockResolvedValue(),
			},
			guilds: {
				fetch: jest.fn().mockResolvedValue(),
			},
			user: {
				setStatus: jest.fn(),
			},
		};
		mockLocation = {
			id: location_id,
		};
		mockWsHealthcheck.latest_ws_id = location_id;
		mockFtApi.getLatestLocation.mockResolvedValue(mockLocation);
		await onReady(mockClient);
		jest.advanceTimersByTime(60 * 1000);
	});

	test('should fetch the application', () => {
		expect(mockClient.application.fetch).toHaveBeenCalledTimes(1);
	});

	test('should fetch the guilds', () => {
		expect(mockClient.guilds.fetch).toHaveBeenCalledTimes(1);
	});

	test('should init the HTTP app', () => {
		expect(mockInitApp).toHaveBeenCalledWith(mockClient);
	});

	test('should listen on port 3000 (default)', () => {
		expect(mockApp.listen.mock.calls[0][0]).toBe(3000);
	});

	test('should deploy commands', () => {
		expect(mockDeployCommands).toHaveBeenCalledTimes(1);
	});

	test('should reset roles', () => {
		expect(mockResetRoles).toHaveBeenCalledTimes(1);
	});

	test('should fetch users map', () => {
		expect(mockInitUsersMap).toHaveBeenCalledTimes(1);
	});

	test('should run a websocket health checker', () => {
		expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
	});

	test('should initialize the websocket', () => {
		expect(mockInitWebsocket).toHaveBeenCalledTimes(1);
	});

});
