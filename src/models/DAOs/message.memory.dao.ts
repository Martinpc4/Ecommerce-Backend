// ! Imports
// * DTOs
import { MessageClass } from '../DTOs/message.dto';
// * Interfaces
import { Types } from 'mongoose';

// ! DAO Definition
class MessageDAO {
	private messages: MessageClass[];
	constructor() {
		this.messages = [];
	}
	existsById(messageId: Types.ObjectId): boolean {
		for (const messageInstance of this.messages) {
			if (messageInstance._id.equals(messageId)) {
				return true;
			}
		}
		return false;
	}
	create(messageInstance: MessageClass): boolean {
		if (!this.existsById(messageInstance._id)) {
			this.messages.push(messageInstance);
			return true;
		} else {
			throw new Error(`Message ${messageInstance._id} has already been created`);
		}
	}
	deleteById(messageId: Types.ObjectId): boolean {
		if (!this.existsById(messageId)) {
			throw new Error(`Message ${messageId} does not exist`);
		}
		let messagesArray: MessageClass[] = [];
		let flagVar: boolean = false;
		for (const messageInstance of this.messages) {
			if (!messageInstance._id.equals(messageId)) {
				messagesArray.push(messageInstance);
			} else {
				flagVar = true;
			}
		}
		if (flagVar) {
			return true;
		} else {
			throw new Error(`Internal server error`);
		}
	}
	getAll(): MessageClass[] {
		return this.messages;
	}
	getById(messageId: Types.ObjectId): MessageClass {
		if (this.existsById(messageId)) {
			for (const messageInstance of this.messages) {
				if (messageInstance._id.equals(messageId)) {
					return messageInstance;
				}
			}
			throw new Error(`Internal server error`);
		} else {
			throw new Error(`Message ${messageId} does not exist`);
		}
	}
}

// ! Exports
export default MessageDAO;
