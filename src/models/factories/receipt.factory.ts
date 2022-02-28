// ! Imports
// * DAOs
import ReceiptMongooseDAO from '../DAOs/receipt.mongoose.dao';
import ReceiptMemoryDAO from '../DAOs/receipt.memory.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definition
const storageOption: string = arguments.storage;

let ReceiptDAO: ReceiptMemoryDAO | ReceiptMongooseDAO;

if (storageOption === 'mongoose') {
	ReceiptDAO = new ReceiptMongooseDAO();
} else {
	ReceiptDAO = new ReceiptMemoryDAO();
}

// ! Exports
export default ReceiptDAO;
