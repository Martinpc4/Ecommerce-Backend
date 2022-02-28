// ! Imports
// * Interfaces
import { Server as SocketServer } from 'socket.io';
import { messagePropertiesInterface } from '../models/interfaces/message.interface';
// * Logs
import logger from '../server/logs/index.logs';
// * Services
import MessageService from '../services/message.service';

// ! Controller Definition
class MessageControllerClass {
	async receiveMessage(messageProperties: messagePropertiesInterface, io: SocketServer): Promise<void> {
		try {
			if (
				messageProperties.userId === undefined ||
				messageProperties.content === undefined ||
				messageProperties.type === undefined
			) {
				logger.http({
					message: 'Missing parameters',
					router: 'IO',
					method: 'SocketIO',
					route: 'message-send',
				});
			}
			io.emit(
				'messages',
				await MessageService.createMessage(
					messageProperties.userId,
					messageProperties.content,
					messageProperties.type
				)
			);
			logger.http({
				message: 'Message successfully received and created',
				router: 'IO',
				method: 'SocketIO',
				route: 'message-send',
			});
		} catch (err) {
			logger.error({
				message: 'Error in creating message',
				router: 'IO',
				method: 'SocketIO',
				route: 'message-send',
				stack: err,
			});
		}
	}
}

// ! Controller Instance
const MessageController = new MessageControllerClass();

// ! Exports
export default MessageController;
