// ! Imports
// * Services
import mongoose from '../services/mongodb.services';

// ! Interface Definition
interface receiptPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	cartId: mongoose.Types.ObjectId;
	total: number;
	timeStamp: Date;
}

// ! Exports
export { receiptPropertiesInterface };
