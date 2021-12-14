// ! Imports
// * Interfaces
import { receiptPropertiesInterface } from '../interfaces/receipt.interfaces';
// * Config
import mongoose from '../config/mongodb.config';

// ! Class
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
