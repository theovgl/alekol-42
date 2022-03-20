const { faker } = require('@faker-js/faker');
const { onMessage } = require('../utils/websocket.js');

jest.mock('../src/users.js');
const mockUsers = require('../src/users.js');
jest.mock('../src/logs.js');
const { logAction: mockLogAction } = require('../src/logs.js');

const host = faker.internet.ip();
const begin_at = faker.date.recent();
const end_at = faker.date.recent();
const ft_login = faker.internet.userName();
let mockUser;
let mockMessage;

describe('onMessage', () => {

	function initMocks() {
		jest.resetAllMocks();
		mockUser = {
			updateRole: jest.fn().mockResolvedValue(),
		};
		mockUsers.findWithDb.mockResolvedValue(mockUser);
		mockMessage = {
			identifier: {
				channel: 'LocationChannel',
			},
			message: {
				location: {
					login: ft_login,
					end_at,
					host,
					begin_at,
				},
			},
		};
	}

	describe('when the message is not JSON formatted', () => {

		beforeAll(async () => {
			initMocks();
			mockMessage.identifier = JSON.stringify(mockMessage.identifier);
			await onMessage(faker.datatype.string());
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'Could not parse the JSON message from websocket');
		});

	});

	describe('when the message is not a location update', () => {

		beforeAll(async () => {
			initMocks();
			mockMessage.identifier.channel = 'OtherChannel';
			mockMessage.identifier = JSON.stringify(mockMessage.identifier);
			await onMessage(JSON.stringify(mockMessage));
		});

		test('should log a message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.log, 'The message does not concern an update of an user\'s location');
		});

	});

	describe('when the role update fails', () => {

		beforeAll(async () => {
			initMocks();
			mockUser.updateRole.mockRejectedValue();
			mockMessage.identifier = JSON.stringify(mockMessage.identifier);
			await onMessage(JSON.stringify(mockMessage));
		});

		test('should log an error message', () => {
			expect(mockLogAction).toHaveBeenCalledWith(console.error, 'An error occured while updating the role');
		});

	});

	describe('when everything is ok', () => {

		beforeAll(async () => {
			initMocks();
			mockMessage.identifier = JSON.stringify(mockMessage.identifier);
			await onMessage(JSON.stringify(mockMessage));
		});

		test('should get the user', () => {
			expect(mockUsers.findWithDb).toHaveBeenCalledWith(ft_login);
		});

		test('should update the user\'s role', () => {
			expect(mockUser.updateRole).toHaveBeenCalled();
		});

	});

});
