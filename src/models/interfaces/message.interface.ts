import { Types } from 'mongoose';

enum MessageTypeEnum {
	user = 'USER',
	system = 'SYSTEM',
	admin = 'ADMIN',
}

interface messagePropertiesInterface {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	type: MessageTypeEnum;
	timeStamp: Date;
	content: string;
}

export { MessageTypeEnum, messagePropertiesInterface };
