const { faker } = require('@faker-js/faker');
const resetRoles = require('../src/resetRoles.js');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/logs.js');
const { logAction: mockLogAction } = require('../src/logs.js');

const client_id = faker.datatype.number();
const role_name = faker.name.jobType();
let mockGuildData;
let mockRoleRemove;
let mockRoleMembers;
let mockRoleManager;
let mockRoleFind;
let mockMembersFetch;
let mockCachedGuilds;
let mockDiscordClient;

function initMocks() {
	jest.resetAllMocks();
	mockGuildData = {
		role: role_name,
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
	mockRoleFind = jest.fn().mockReturnValue(mockRoleManager);
	mockMembersFetch = jest.fn().mockResolvedValue();
	mockCachedGuilds = [];
	for (let i = 0; i < 2; i++) {
		mockCachedGuilds.push({
			id: faker.datatype.number(),
			name: faker.datatype.number(),
			members: {
				fetch: mockMembersFetch,
			},
			roles: {
				cache: {
					find: mockRoleFind,
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

describe('when the role was not found in the guild', () => {

	beforeAll(async () => {
		initMocks();
		mockRoleFind.mockReturnValue(null);
		await resetRoles(mockDiscordClient);
	});

	test('should write an error message', () => {
		for (const guild of mockCachedGuilds) {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, `The role ${role_name} has not been found in guild ${guild.name}`);
		}
	});

	test('should continue', () => {
		expect(mockRoleFind).toHaveBeenCalledTimes(2);
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
		expect(mockRoleFind).toHaveBeenCalledTimes(2);
	});

	test('should remove the role to each member', async () => {
		expect(mockRoleRemove).toHaveBeenCalledTimes(2 * 5);
	});

});
