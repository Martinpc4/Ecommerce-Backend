// ! Imports
// * DTOs
import { MessageClass } from '../models/DTOs/message.dto';
// * Factories
import MessageDAO from '../models/factories/message.factory';
// * Interfaces
import { Types } from 'mongoose';
import { MessageTypeEnum } from '../models/interfaces/message.interface';
// * Services
import UserService from './user.service';

// ! Service Definition
class MessageServiceClass {
	async existsById(receiptId: Types.ObjectId): Promise<boolean> {
		return (await MessageDAO.existsById(receiptId)) !== null;
	}

	async getAll(): Promise<MessageClass[]> {
		return await MessageDAO.getAll();
	}
	async getById(messageId: Types.ObjectId): Promise<MessageClass> {
		if (!(await this.existsById(messageId))) {
			throw new Error(`Message ${messageId} does not exist`);
		}
		return await MessageDAO.getById(messageId);
	}
	async deleteMessage(messageId: Types.ObjectId): Promise<boolean> {
		if (!(await this.existsById(messageId))) {
			throw new Error(`Message ${messageId} does not exist`);
		}
		await MessageDAO.deleteById(messageId);
		if (!(await this.existsById(messageId))) {
			return true;
		}
		throw new Error(`Message ${messageId} could not be deleted`);
	}
	async createMessage(userId: Types.ObjectId, content: string, messageType: MessageTypeEnum): Promise<MessageClass> {
		if (!(await UserService.existsById(userId))) {
			throw new Error('User not found');
		}

		const messageInstance: MessageClass = new MessageClass({
			timeStamp: new Date(),
			_id: new Types.ObjectId(),
			userId: userId,
			type: messageType,
			content,
		});

		await MessageDAO.create(messageInstance);

		if (await this.existsById(messageInstance._id)) {
			return messageInstance;
		} else {
			throw new Error(`Message ${messageInstance._id} could not be created`);
		}
	}
}

// ! Service Instance
const MessageService: MessageServiceClass = new MessageServiceClass();

// ! Exports
export default MessageService;
