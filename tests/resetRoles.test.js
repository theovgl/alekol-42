const { faker } = require('@faker-js/faker');
const resetRoles = require('../src/resetRoles.js');

let member_remove_role;
let members;
let role;
let role_find;
let guilds;
let mockSupabase;
let mockDiscordClient;
beforeEach(() => {
	member_remove_role = jest.fn();
	members = [];
	for (let i = 0; i < 5; i++) {
		members.push({ roles: { remove: member_remove_role } });
	}
	role = {
		members: {
			values: jest.fn().mockReturnValue(members)
		}
	};
	role_find = jest.fn().mockReturnValue(role)
	members_fetch = jest.fn().mockResolvedValue()
	guilds = [];
	for (let i = 0; i < 5; i++) {
		guilds.push({
			id: faker.datatype.number(),
			roles: {
				cache: {
					find: role_find
				}
			},
			members: {
				fetch: members_fetch
			}
		});
	}
	mockSupabase = {
		fetchGuild: jest.fn().mockResolvedValue()
	};
	mockDiscordClient = {
		application: {
			id: faker.datatype.number()
		},
		guilds: {
			cache: {
				values: jest.fn().mockReturnValue(guilds)
			}
		}
	};
});

test('should fetch the guilds from the database', async () => {
	await resetRoles(mockSupabase, mockDiscordClient);
	for (const guild of guilds) {
		expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(guild.id, mockDiscordClient.application.id);
	}
});

test('should fetch the each guild`s members', async () => {
	await resetRoles(mockSupabase, mockDiscordClient);
	expect(members_fetch).toHaveBeenCalledTimes(5);
});

test('should get the role manager of each guild', async () => {
	await resetRoles(mockSupabase, mockDiscordClient);
	expect(role_find).toHaveBeenCalledTimes(5);
});

test('should remove the role to each member', async () => {
	await resetRoles(mockSupabase, mockDiscordClient);
	expect(member_remove_role).toHaveBeenCalledTimes(5 * 5);
});
