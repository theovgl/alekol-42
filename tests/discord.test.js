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
const role_id = faker.datatype.number();
const location_id = faker.datatype.number();
const role_name = faker.name.jobType();
const color = faker.datatype.number();
const mockError = faker.hacker.phrase();
const mockReturn = faker.datatype.number();
let mockGuild;
let mockMember;
let mockUser;
let mockUserData;
let mockInteraction;
let mockCommand;
let mockClient;
let mockApp;
let mockLocation;
let mockOldRole;
let mockNewRole;
let mockGuildData;
let mockRoleRemove;
let mockRoleAdd;
let ret;

describe('onGuildCreate', () => {

	function initMocks() {
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
	}

	describe('when the guild\'s insertion fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.insertGuild.mockRejectedValue(mockError);
			await onGuildCreate(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while joining the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
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

	function initMocks() {
		jest.resetAllMocks();
		mockGuild = {
			id: guild_id,
			name: guild_name,
			client: {
				application: {
					id: client_id,
				},
			},
		};
		mockSupabase.deleteGuild.mockResolvedValue();
		mockSupabase.deleteUsersOfGuild.mockResolvedValue();
	}

	describe('when the guild\'s users deletion fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteUsersOfGuild.mockRejectedValue(mockError);
			await onGuildDelete(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while leaving the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the guild\'s deletion fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteGuild.mockRejectedValue(mockError);
			await onGuildDelete(mockGuild);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while leaving the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the deletions succeed', () => {

		beforeAll(async () => {
			initMocks();
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

	function initMocks() {
		jest.resetAllMocks();
		mockMember = {
			fetch: jest.fn().mockResolvedValue(),
		};
	}

	describe('when the member\'s fetch fails', () => {

		beforeAll(async () => {
			initMocks();
			mockMember.fetch.mockRejectedValue(mockError);
			await onGuildMemberAdd(mockMember);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while fetching the member');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the member\'s fetch succeeds', () => {

		beforeAll(async () => {
			initMocks();
			await onGuildMemberAdd(mockMember);
		});

		test('should fetch the member from discord', () => {
			expect(mockMember.fetch).toHaveBeenCalledTimes(1);
		});

	});

});

describe('onGuildMemberRemove', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockUserData = [{
			discord_id,
			ft_login,
			guild_id,
		}];
		mockSupabase.deleteUser.mockResolvedValue(mockUserData);
		mockUser = {
			guilds_member: [
				{ guild: { id: guild_id } },
				{ guild: { id: guild_id + '1' } },
			],
		};
		mockUsers.find.mockReturnValue({ data: mockUser });
		mockMember = {
			id: member_id,
			client: {
				application: {
					id: client_id,
				},
			},
			guild: {
				id: guild_id,
			},
		};
	}

	describe('when the member\'s deletion fails', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteUser.mockRejectedValue(mockError);
			await onGuildMemberRemove(mockMember);
		});

		test('should log an error message', () => {
			expect(logAction).toHaveBeenCalledWith(console.error, 'An error occured while the member left the guild');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

	});

	describe('when the member was not registered', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.deleteUser.mockResolvedValue([]);
			await onGuildMemberRemove(mockMember);
		});

		test('should return before finding it in the tree', () => {
			expect(mockUsers.find).toHaveBeenCalledTimes(0);
		});

	});

	describe('when the member is not in the binary tree', () => {

		beforeAll(async () => {
			initMocks();
			mockUsers.find.mockReturnValue(null);
			mockUser.guilds_member = {
				filter: jest.fn(),
			};
			mockUser.guilds_member.filter.mockReturnValue(mockUser);
			await onGuildMemberRemove(mockMember);
		});

		test('should return before filtering their guilds', () => {
			expect(mockUser.guilds_member.filter).not.toHaveBeenCalled();
		});

	});

	describe('when the member deletion succeeds', () => {

		beforeAll(async () => {
			initMocks();
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

	function initMocks() {
		jest.resetAllMocks();
		mockOldRole = {
			members: [],
		};
		mockRoleAdd = jest.fn().mockResolvedValue();
		mockRoleRemove = jest.fn().mockResolvedValue();
		for (let i = 0; i < 5; i++) {
			mockOldRole.members.push({
				roles: {
					add: mockRoleAdd,
					remove: mockRoleRemove,
				},
			});
		}
		mockNewRole = {
			color,
			name: role_name,
		};
		mockInteraction = {
			applicationId: client_id,
			commandName: command_name,
			customId: 'role_selector',
			editReply: jest.fn().mockResolvedValue(),
			guild: {
				roles: {
					cache: {
						get: jest.fn().mockReturnValue(mockOldRole)
							.mockReturnValueOnce(mockNewRole),
					},
				},
			},
			guildId: guild_id,
			isCommand: jest.fn().mockReturnValue(false),
			isSelectMenu: jest.fn().mockReturnValue(false),
			update: jest.fn(),
			values: [role_id],
		};
		mockGuildData = {
			role: role_id,
		};
		mockSupabase.fetchGuild.mockResolvedValue([mockGuildData]);
		mockCommand = {
			execute: jest.fn().mockResolvedValue(),
		};
		global.commands = {
			get: jest.fn().mockReturnValue(mockCommand),
		};
	}

	describe('when it is a command', () => {

		describe('and the command was not found', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isCommand.mockReturnValue(true);
				global.commands.get.mockReturnValueOnce(null);
				await onInteractionCreate(mockInteraction);
			});

			test('should return before executing the command', () => {
				expect(mockCommand.execute).toHaveBeenCalledTimes(0);
			});

		});

		describe('and the command fails to execute', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isCommand.mockReturnValue(true);
				mockCommand.execute.mockRejectedValueOnce(mockError);
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

		describe('and the command executes successfuly', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isCommand.mockReturnValue(true);
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

	describe('when it is a select menu answer', () => {

		describe('and the role does not exist', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockInteraction.update.mockResolvedValue(mockReturn);
				mockInteraction.guild.roles.cache.get.mockReset().mockReturnValue(null);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should update the interaction with a message', () => {
				expect(mockInteraction.update).toHaveBeenCalledWith({ content: '🤔 This role does not exist anymore', components: [] });
			});

			test('should return the message', () => {
				expect(ret).toBe(mockReturn);
			});

		});

		describe('and the guild fetch fails', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockInteraction.update.mockResolvedValue(mockReturn);
				mockSupabase.fetchGuild.mockRejectedValue(mockError);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should write an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should update the interaction with a message', () => {
				expect(mockInteraction.update).toHaveBeenCalledWith({ content: '😵 An error occurred... Please try again later!', components: [] });
			});

			test('should return the message', () => {
				expect(ret).toBe(mockReturn);
			});

		});

		describe('and the guild update fails', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockInteraction.update.mockResolvedValue(mockReturn);
				mockSupabase.setGuildRole.mockRejectedValue(mockError);
				await onInteractionCreate(mockInteraction);
			});

			test('should write an error message', () => {
				expect(console.error).toHaveBeenCalledWith(mockError);
			});

			test('should update the interaction with a message', () => {
				expect(mockInteraction.update).toHaveBeenCalledWith({ content: '😵 An error occurred... Please try again later!', components: [] });
			});

			test('should return the message', () => {
				expect(ret).toBe(mockReturn);
			});

		});

		describe('and the old role does not exist', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockInteraction.guild.roles.cache.get.mockReturnValue(null);
				mockInteraction.update.mockResolvedValue(mockReturn);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should return the interaction update', () => {
				expect(ret).toBe(mockReturn);
			});

		});

		describe('and one role remove fails', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockOldRole.members[0].roles.remove.mockRejectedValueOnce(mockError);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should continue to remove other roles', () => {
				expect(mockRoleRemove).toHaveBeenCalledTimes(5);
				expect(mockRoleAdd).toHaveBeenCalledTimes(4);
			});

		});

		describe('and one role add fails', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockOldRole.members[0].roles.add.mockRejectedValueOnce(mockError);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should continue to remove other roles', () => {
				expect(mockRoleRemove).toHaveBeenCalledTimes(5);
				expect(mockRoleAdd).toHaveBeenCalledTimes(5);
			});

		});

		describe('and everything is ok', () => {

			beforeAll(async () => {
				initMocks();
				mockInteraction.isSelectMenu.mockReturnValue(true);
				mockInteraction.update.mockResolvedValue(mockReturn);
				ret = await onInteractionCreate(mockInteraction);
			});

			test('should get the new role', () => {
				expect(mockInteraction.guild.roles.cache.get).toHaveBeenCalledWith(role_id);
			});

			test('should fetch the guild from the database', () => {
				expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(guild_id, client_id);
			});

			test('should get the old role', () => {
				expect(mockInteraction.guild.roles.cache.get).toHaveBeenCalledWith(role_id);
			});

			test('should set the new role in the database', () => {
				expect(mockSupabase.setGuildRole).toHaveBeenCalledWith(guild_id, client_id, role_id);
			});

			test('should replace the members\' role', () => {
				expect(mockRoleAdd).toHaveBeenCalledTimes(5);
				expect(mockRoleRemove).toHaveBeenCalledTimes(5);
			});

			test('should reply with an embed only', () => {
				expect(ret).toBe(mockReturn);
			});

			describe('the embedded message', () => {

				test('should have a color', () => {
					expect(mockInteraction.update.mock.calls[0][0].embeds[0].color).toBe(color);
				});

				test('should have a name field', () => {
					expect(mockInteraction.update.mock.calls[0][0].embeds[0].fields[0]).toMatchObject({
						name: 'Name',
						value: role_name,
					});
				});

			});

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
		mockFtApi.getLatestActiveLocation.mockResolvedValue(mockLocation);
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
