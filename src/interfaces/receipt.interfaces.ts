// ! Imports
// * Config
import mongoose from '../config/mongodb.config';

// ! Interface
interface receiptPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	cartId: mongoose.Types.ObjectId;
	total: number;
	timeStamp: Date;
}

// ! Exports
export { receiptPropertiesInterface };
