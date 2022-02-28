// ! Imports
// * DTOs
import { MessageClass } from '../DTOs/message.dto';
// * Interfaces
import { Types } from 'mongoose';
import { messagePropertiesInterface } from '../interfaces/message.interface';
// * Models
import MessageModel from '../message.model';

// ! DAO Definition
class MessageDAO {
	async existsById(messageId: Types.ObjectId): Promise<boolean> {
		return (await MessageModel.findById(messageId)) !== null;
	}
	async create(messageInstance: MessageClass): Promise<boolean> {
		if (!(await this.existsById(messageInstance._id))) {
			await new MessageModel(messageInstance).save();

			if (await this.existsById(messageInstance._id)) {
				return true;
			} else {
				throw new Error(`Internal server error`);
			}
		} else {
			throw new Error(`Message ${messageInstance._id} has already been created`);
		}
	}
	async deleteById(messageId: Types.ObjectId): Promise<boolean> {
		if (!this.existsById(messageId)) {
			throw new Error(`Message ${messageId} does not exist`);
		}
		await MessageModel.findByIdAndRemove(messageId);
		if (!(await this.existsById(messageId))) {
			return true;
		} else {
			throw new Error(`Internal server error`);
		}
	}
	async getAll(): Promise<MessageClass[]> {
		return await MessageModel.find({});
	}
	async getById(messageId: Types.ObjectId): Promise<MessageClass> {
		if (await this.existsById(messageId)) {
			const messageInstance: null | messagePropertiesInterface = await MessageModel.findById(messageId);
			if (messageInstance !== null) {
				return messageInstance;
			} else {
				throw new Error(`Internal server error`);
			}
		} else {
			throw new Error(`Message ${messageId} does not exist`);
		}
	}
}

// ! Exports
export default MessageDAO;
