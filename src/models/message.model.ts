// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { messagePropertiesInterface } from './interfaces/message.interface';

// ! Model's Schema Definition
const messageSchema: Schema = new Schema<messagePropertiesInterface>({
	userId: { type: Schema.Types.ObjectId, required: true },
	type: { type: String, required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
	content: { type: String, required: true },
});

// ! Model Instance
const MessageModel = model<messagePropertiesInterface>('messages', messageSchema);

// ! Exports
export default MessageModel;
