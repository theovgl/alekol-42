const { faker } = require('@faker-js/faker');
const User = require('../src/User.js');

global.console = {
	log: jest.fn(),
	error: jest.fn()
};

const guild_data = {
	id: faker.datatype.number().toString(),
	name: faker.company.companyName(),
	client_id: faker.datatype.number().toString(),
	role: faker.name.jobType()
};
let mockSupabase;
const ft_login = faker.internet.userName();
const mockFindCachedRole = jest.fn().mockReturnValue(true);
const mockMemberRoles = {
	add: jest.fn().mockResolvedValue(),
	remove: jest.fn().mockResolvedValue()
};
let guilds_member = [];
for (let i = 0; i < 5; i++) {
	guilds_member.push({
		guild: {
			id: faker.datatype.number(),
			roles: {
				cache: {
					find: mockFindCachedRole
				}
			}
		},
		roles: mockMemberRoles
	});
}
let user;
let user_host;
let user_begin_at;
const application_id = faker.datatype.number().toString();
let mockDiscordClient;
beforeEach(() => {
	mockSupabase = {
		fetchGuild: jest.fn().mockResolvedValue([guild_data])
	};
	mockFindCachedRole.mockReset().mockReturnValue(true);
	mockMemberRoles.add.mockReset();
	mockMemberRoles.remove.mockReset();
	user = new User(ft_login, guilds_member);
	user.host = user_host;
	user.begin_at = user_begin_at;
	mockDiscordClient = {
		application: {
			id: application_id
		}
	};
});

describe('updateRole', () => {

	const configs = [
		{ message: 'in', user: { host: faker.internet.ip(), begin_at: faker.date.recent() } },
		{ message: 'out', user: { host: null, begin_at: null } }
	];
	for (const config of configs)
	{
		describe(`when the user is logged ${config.message}`, () => {

			test('should fetch the guild data from the database', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				for (const guild_member of guilds_member) {
					expect(mockSupabase.fetchGuild).toHaveBeenCalledWith(guild_member.guild.id, mockDiscordClient.application.id);
				}
			});

			test('should find the role from the guild', async () => {
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockFindCachedRole).toHaveBeenCalledTimes(5);
			});

			test('should continue if the role was not found', async () => {
				mockFindCachedRole.mockReturnValue(false);
				await user.updateRole(mockSupabase, mockDiscordClient);
				expect(mockFindCachedRole).toHaveBeenCalledTimes(5);
			});

			test('should update the role', async () => {
				user.host = config.user.host;
				user.begin_at = config.user.begin_at;
				await user.updateRole(mockSupabase, mockDiscordClient);
				if (config.user.host) expect(mockMemberRoles.add).toHaveBeenCalledTimes(5);
				else expect(mockMemberRoles.remove).toHaveBeenCalledTimes(5);
			});

		});
	}

});
