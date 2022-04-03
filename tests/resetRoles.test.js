const { faker } = require('@faker-js/faker');
const resetRoles = require('../src/resetRoles.js');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/logs.js');
const { logAction: mockLogAction } = require('../src/logs.js');
global.console.error = jest.fn();

const client_id = faker.datatype.number();
const role_id = faker.datatype.number();
let mockGuildData;
let mockRoleRemove;
let mockRoleMembers;
let mockRoleManager;
let mockRoleGet;
let mockMembersFetch;
let mockCachedGuilds;
let mockDiscordClient;
let ret;

function initMocks() {
	jest.resetAllMocks();
	mockGuildData = {
		role: role_id,
	};
	mockSupabase.fetchGuild.mockResolvedValue([mockGuildData]);
	mockRoleRemove = jest.fn().mockResolvedValue();
	mockRoleMembers = [];
	for (let i = 0; i < 5; i++) {
		mockRoleMembers.push({
			roles: {
				remove: mockRoleRemove,
			},
		});
	}
	mockRoleManager = {
		members: {
			values: jest.fn().mockReturnValue(mockRoleMembers),
		},
	};
	mockRoleGet = jest.fn().mockReturnValue(mockRoleManager);
	mockMembersFetch = jest.fn().mockResolvedValue();
	mockCachedGuilds = [];
	for (let i = 0; i < 2; i++) {
		mockCachedGuilds.push({
			id: faker.datatype.number(),
			name: faker.company.companyName(),
			members: {
				fetch: mockMembersFetch,
			},
			roles: {
				cache: {
					get: mockRoleGet,
				},
			},
		});
	}
	mockDiscordClient = {
		application: {
			id: client_id,
		},
		guilds: {
			cache: {
				values: jest.fn().mockReturnValue(mockCachedGuilds),
			},
		},
	};
}

describe('when the role is not set', () => {

	beforeAll(async () => {
		initMocks();
		mockGuildData = {
			role: null,
		};
		mockSupabase.fetchGuild.mockResolvedValue([mockGuildData]);
		ret = await resetRoles(mockDiscordClient);
	});

	test('should log an error message', () => {
		expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while resetting role');
		expect(mockLogAction).toHaveBeenCalledTimes(mockCachedGuilds.length);
	});

	test('should return null', () => {
		expect(ret).toBeInstanceOf(Array);
		for (const elm of ret) {
			expect(elm).toBeNull();
		}
	});

	test('should continue', () => {
		expect(mockSupabase.fetchGuild).toHaveBeenCalledTimes(2);
	});

});

describe('when the role was not found in the guild', () => {

	beforeAll(async () => {
		initMocks();
		mockRoleGet.mockReturnValue(null);
		await resetRoles(mockDiscordClient);
	});

	test('should log an error message', () => {
		expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while resetting role');
		expect(mockLogAction).toHaveBeenCalledTimes(mockCachedGuilds.length);
	});

	test('should continue', () => {
		expect(mockRoleGet).toHaveBeenCalledTimes(2);
	});

});

describe('when everything is ok', () => {

	beforeAll(async () => {
		initMocks();
		await resetRoles(mockDiscordClient);
	});

	test('should fetch the guilds from the database', async () => {
		for (const guild of mockCachedGuilds) {
			expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(guild.id, client_id);
		}
	});

	test('should fetch the each guild`s members', async () => {
		expect(mockMembersFetch).toHaveBeenCalledTimes(2);
	});

	test('should get the role manager of each guild', async () => {
		expect(mockRoleGet).toHaveBeenCalledTimes(2);
	});

	test('should remove the role to each member', async () => {
		expect(mockRoleRemove).toHaveBeenCalledTimes(2 * 5);
	});

});
