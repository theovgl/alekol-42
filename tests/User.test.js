const { faker } = require('@faker-js/faker');
const User = require('../src/User.js');

jest.mock('../utils/supabase.js');
const mockSupabase = require('../utils/supabase.js');
jest.mock('../src/logs.js');
const { logAction: mockLogAction } = require('../src/logs.js');
global.console.error = jest.fn();

const ft_login = faker.internet.userName();
const role_id = faker.datatype.number();
const host = faker.internet.ip();
const begin_at = faker.date.recent();
const client_id = faker.datatype.number().toString();
const mockError = new Error(faker.hacker.phrase());
let guilds_member;
let mockCachedRole;
let mockMember;
let user;
let ret;
let mockGuildData;

describe('updateMemberRole', () => {

	function initMocks() {
		jest.resetAllMocks();
		guilds_member = [];
		user = new User(ft_login, guilds_member);
		mockCachedRole = {
		};
		mockMember = {
			guild: {
				roles: {
					cache: {
						get: jest.fn().mockReturnValue(mockCachedRole),
					},
				},
			},
			roles: {
				add: jest.fn().mockResolvedValue(mockMember),
				remove: jest.fn().mockResolvedValue(mockMember),
			},
		};
	}

	describe('when the role was not found', () => {

		beforeAll(() => {
			initMocks();
			mockMember.guild.roles.cache.get.mockReturnValue(null);
			ret = user.updateMemberRole(mockMember, role_id);
		});

		test('should reject the promise', () => {
			return expect(ret).rejects.toThrow(`Could not find the role (${role_id}) in the guild`);
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			ret = await user.updateMemberRole(mockMember, role_id);
		});

		test('should get the role from the guild', () => {
			expect(mockMember.guild.roles.cache.get).toHaveBeenCalledTimes(1);
		});

		test('should return the initial member object', () => {
			expect(JSON.stringify(ret)).toEqual(JSON.stringify(mockMember));
		});

	});

	describe('when the user is logged in', () => {

		beforeAll(async () => {
			initMocks();
			user.host = host;
			user.begin_at = begin_at;
			ret = await user.updateMemberRole(mockMember, role_id);
		});

		test('should add the role', () => {
			expect(mockMember.roles.add).toHaveBeenCalledWith(mockCachedRole);
		});

	});

	describe('when the user is logged out', () => {

		beforeAll(async () => {
			initMocks();
			ret = await user.updateMemberRole(mockMember, role_id);
		});

		test('should remove the role', () => {
			expect(mockMember.roles.remove).toHaveBeenCalledWith(mockCachedRole);
		});

	});

});

describe('updateRole', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockGuildData = {
			role: role_id,
		};
		mockSupabase.fetchGuild.mockResolvedValue([mockGuildData]);
		guilds_member = [];
		for (let i = 0; i < 5; i++) {
			guilds_member.push({
				client: {
					application: {
						id: client_id,
					},
				},
				guild: {
					id: faker.datatype.number().toString(),
				},
			});
		}
		user = new User(ft_login, guilds_member);
		user.updateMemberRole = jest.fn().mockResolvedValue();
	}

	describe('when the guild could not be fetched', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchGuild.mockRejectedValue(mockError);
			ret = await user.updateRole();
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while fetching the guild\'s data');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should return an array of null', () => {
			expect(ret).toBeInstanceOf(Array);
			for (const elm of ret) {
				expect(elm).toBeNull();
			}
		});

		test('should continue to fetch guilds', () => {
			for (const member of guilds_member) {
				expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(member.guild.id, member.client.application.id);
			}
		});

	});

	describe('when the guild does not exist', () => {

		beforeAll(async () => {
			initMocks();
			mockSupabase.fetchGuild.mockResolvedValue([]);
			ret = await user.updateRole();
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while fetching the guild\'s data');
		});

		test('should return an array of null', () => {
			expect(ret).toBeInstanceOf(Array);
			for (const elm of ret) {
				expect(elm).toBeNull();
			}
		});

		test('should continue to fetch guilds', () => {
			for (const member of guilds_member) {
				expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(member.guild.id, member.client.application.id);
			}
		});

	});

	describe('when the role has not been set', () => {

		beforeAll(async () => {
			initMocks();
			mockGuildData = {
				role: null,
			};
			mockSupabase.fetchGuild.mockResolvedValue([mockGuildData]);
			ret = await user.updateRole();
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while fetching the guild\'s data');
		});

		test('should return an array of null', () => {
			expect(ret).toBeInstanceOf(Array);
			for (const elm of ret) {
				expect(elm).toBeNull();
			}
		});

		test('should continue to fetch guilds', () => {
			for (const member of guilds_member) {
				expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(member.guild.id, member.client.application.id);
			}
		});

	});

	describe('when the role update fails', () => {

		beforeAll(async () => {
			initMocks();
			user.updateMemberRole.mockRejectedValue(mockError);
			ret = await user.updateRole();
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while updating the member role');
			expect(console.error).toHaveBeenCalledWith(mockError);
		});

		test('should return an array of null', () => {
			expect(ret).toBeInstanceOf(Array);
			for (const elm of ret) {
				expect(elm).toBeNull();
			}
		});

		test('should continue to update roles', () => {
			for (const member of guilds_member) {
				expect(user.updateMemberRole).toHaveBeenCalledWith(member, role_id);
			}
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			ret = await user.updateRole();
		});

		test('should fetch each guild', () => {
			for (const member of guilds_member) {
				expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(member.guild.id, member.client.application.id);
			}
		});

		test('should update each member role', () => {
			for (const member of guilds_member) {
				expect(user.updateMemberRole).toHaveBeenCalledWith(member, role_id);
			}
		});

		test('should return an array', () => {
			expect(ret).toBeInstanceOf(Array);
		});

	});

});
