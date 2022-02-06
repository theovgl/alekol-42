const dotenv = require('dotenv');
dotenv.config();
const UserTree = require('../src/UserTree.js');
const { onOpen, onClose, onMessage, onError } = require('../utils/websocket.js');

console.log = jest.fn();
console.error = jest.fn();

describe('onOpen', () => {

	const mockWebSocketSend = jest.fn();

	onOpen({ send: mockWebSocketSend })();

	const channels = ['LocationChannel', 'NotificationChannel', 'FlashChannel'];
	for (const channel of channels) {
		const ws_regex = new RegExp(`\\{"command":"subscribe","identifier":"\\{\\\\"channel\\\\":\\\\"${channel}\\\\",\\\\"user_id\\\\":\\d+\\}"\\}`);
		test(`should subscribe to ${channel}`, () => {
			expect(mockWebSocketSend).toHaveBeenCalledWith(expect.stringMatching(ws_regex));
		});
	}

});

/*
 * {
 *   "identifier": "{ \"channel\": string, \"user_id\": number }",
 *   "message": {
 *     "location": {
 *       "id": number,
 *       "user_id": number,
 *       "begin_at": Date,
 *       "end_at": (Date|null),
 *       "primary": boolean,
 *       "host": string,
 *       "campus_id": number,
 *       "login": string,
 *       "image": Url
 *     },
 *     "id": number
 *   }
 * }
 *
 * {"identifier":"{\"channel\":\"LocationChannel\",\"user_id\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"null","primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}
 *
 * */
describe('onMessage', () => {

	let mockUser;
	let mockUsers;
	let mockDiscordClient;
	let mockSupabase;
	beforeEach(() => {
		mockUser = {
			ft_login: 'norminet',
			updateRole: jest.fn()
		};
		mockUsers = {
			find: jest.fn().mockReturnValue({ data: mockUser }),
			insertFromDb: jest.fn().mockResolvedValue(mockUser)
		};
		mockDiscordClient = jest.fn();
		mockSupabase = {
			fetchUser: jest.fn()
		}
	});
	const validJSON = '{"identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":null,"primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}';

	test('should accept a valid JSON object', async () => {
		const response = await onMessage(mockDiscordClient, mockSupabase, mockUsers)(validJSON);
		expect(response).toBeTruthy();
	});

	describe('should refuse an invalid JSON object', () => {

		test('while parsing', async () => {
			await expect(onMessage(mockDiscordClient, mockSupabase, mockUsers)('string')).resolves.not.toThrow();
		});

		test('when the identifier.channel is not \'LocationChannel\'', async () => {
			const response = await onMessage(mockDiscordClient, mockSupabase, mockUsers)('{"identifier":"{\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"null","primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}');
			expect(response).toBeFalsy();
		});

		const messages = [
			{ data: '{"message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"null","primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}', missing_field: 'identifier' },
			{ data: '{"identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":12345}"}', missing_field: 'message' },
			{ data: '{"identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":12345}","message":{"id":12345678}}', missing_field: 'message.location' },
			{ data: '{"identifier":"{\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"null","primary":true,"host":"e1r2p3","campus_id":1},"id":12345678}}', missing_field: 'message.location.login' },
			{ data: '{"identifier":"{\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"null","primary":true,"campus_id":1,"login":"norminet"},"id":12345678}}', missing_field: 'message.location.host' },
			{ data: '{"identifier":"{\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"end_at":"null","primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}', missing_field: 'message.location.begin_at' },
		];
		for (const message of messages) {
			test(`when the ${message.missing_field} is missing`, async () => {
				const response = await onMessage(mockDiscordClient, mockSupabase, mockUsers)(message.data);
				expect(response).toBeFalsy();
			});
		}

	});

	describe('should fetch an user', () => {

		test('by finding it in the binary tree', async () => {
			users = new UserTree();
			const mockUserUpdateRole = jest.fn();
			users.insert("norminet", { ft_login: "norminet", updateRole: mockUserUpdateRole });
			await expect(onMessage(mockDiscordClient, mockSupabase, mockUsers)(validJSON)).resolves.not.toThrow();
		});

		test('by creating it in the binary tree', async () => {
			mockUsers.find.mockClear();
			mockUsers.find.mockReturnValue(null);
			await onMessage(mockDiscordClient, mockSupabase, mockUsers)(validJSON);
			expect(mockUsers.insertFromDb).toHaveBeenCalledWith(mockSupabase, 'norminet');
		});

	});

	test('should not crash when the user doesn\'t exist', async () => {
		mockUsers.insertFromDb.mockClear();
		mockUsers.insertFromDb.mockRejectedValue();
		await expect(onMessage(mockDiscordClient, mockSupabase, mockUsers)(validJSON)).resolves.not.toThrow();
	});

	test('should add the role when the user logs in', async () => {
		users = new UserTree();
		const mockUserUpdateRole = jest.fn();
		users.insert("norminet", { ft_login: "norminet", updateRole: mockUserUpdateRole });
		await onMessage(mockDiscordClient, mockSupabase, users)(validJSON);
		await expect(mockUserUpdateRole).toHaveBeenCalledWith(mockDiscordClient, { host: 'e1r2p3', begin_at: '1970-01-01 00:00:00 UTC' });
	});

	test('should remove the role when the user logs out', async () => {
		users = new UserTree();
		const mockUserUpdateRole = jest.fn();
		users.insert("norminet", { ft_login: "norminet", updateRole: mockUserUpdateRole });
		await onMessage(mockDiscordClient, mockSupabase, users)('{"identifier":"{\\"channel\\":\\"LocationChannel\\",\\"user_id\\":12345}","message":{"location":{"id":12345678,"user_id":12345,"begin_at":"1970-01-01 00:00:00 UTC","end_at":"1970-01-02 00:00:00 UTC","primary":true,"host":"e1r2p3","campus_id":1,"login":"norminet"},"id":12345678}}');
		await expect(mockUserUpdateRole).toHaveBeenCalledWith(mockDiscordClient, null);
	});

});
