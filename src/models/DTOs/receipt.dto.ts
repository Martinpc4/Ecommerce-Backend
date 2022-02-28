// ! Imports
// * Interfaces
import { receiptPropertiesInterface } from '../interfaces/receipt.interface';
import { Types } from 'mongoose';

// ! DTO Definition
class ReceiptClass implements receiptPropertiesInterface {
	_id: Types.ObjectId;
	cartId: Types.ObjectId;
	userId: Types.ObjectId;
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
