import mongoose from '../mongodb';
import { messagesProperties } from '../interfaces/controller.interfaces';

const messagesSchema: mongoose.Schema = new mongoose.Schema<messagesProperties>({
    email: {type: String, required: true},
    timeStamp: { type: Date, required: true, default: new Date() },
    content: { type: String, required: true}
});

const MessagesModel = mongoose.model<messagesProperties>('messages', messagesSchema);

export default MessagesModel;