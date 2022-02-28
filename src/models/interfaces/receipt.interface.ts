// ! Imports
// * Services
import mongoose from '../../services/mongoose.service';

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
