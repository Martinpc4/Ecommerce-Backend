// ! Imports
// * Interfaces
import { messagePropertiesInterface, MessageTypeEnum } from '../interfaces/message.interface';
import { Types } from 'mongoose';

// ! DTO Definition
class MessageClass implements messagePropertiesInterface {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	type: MessageTypeEnum;
	timeStamp: Date;
	content: string;
	constructor(messageProperties: messagePropertiesInterface) {
		this._id = messageProperties._id;
		this.userId = messageProperties.userId;
		this.type = messageProperties.type;
		this.timeStamp = messageProperties.timeStamp;
		this.content = messageProperties.content;
	}
}

// ! Exports
export { MessageClass };
