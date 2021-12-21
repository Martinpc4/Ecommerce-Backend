// ! Imports
// * Types
import { receiptPropertiesInterface } from '../interfaces/receipt.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Class Definition
class ReceiptClass {
	_id: mongoose.Types.ObjectId;
	cartId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	total: number;
	timeStamp: Date;
	constructor(receiptProperties: receiptPropertiesInterface) {
		this._id = receiptProperties._id;
		this.cartId = receiptProperties.cartId;
		this.userId = receiptProperties.userId;
		this.total = receiptProperties.total;
		this.timeStamp = receiptProperties.timeStamp;
	}
}

// ! Exports
export { ReceiptClass };
