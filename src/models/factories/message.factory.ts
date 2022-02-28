// ! Imports
// * DAOs
import MessageMemoryDAO from '../DAOs/message.memory.dao';
import MessageMongooseDAO from '../DAOs/message.mongoose.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definitions
const storageOption: string = arguments.storage;

let MessageDAO: MessageMemoryDAO | MessageMongooseDAO;

if (storageOption === 'mongoose') {
	MessageDAO = new MessageMongooseDAO();
} else {
	MessageDAO = new MessageMemoryDAO();
}

// ! Exports
export default MessageDAO;
