// ! Imports
// * DTOs
import { ReceiptClass } from '../DTOs/receipt.dto';
// * Interfaces
import { Types } from 'mongoose';

// ! DAO Definition
class ReceiptDAO {
	private receipts: ReceiptClass[];
	constructor() {
		this.receipts = [];
	}
	existsById(receiptId: Types.ObjectId): boolean {
		for (const receiptInstance of this.receipts) {
			if (receiptInstance._id.equals(receiptId)) {
				return true;
			}
		}
		return false;
	}
	create(receiptInstance: ReceiptClass): ReceiptClass {
		if (!this.existsById(receiptInstance._id)) {
			this.receipts.push(receiptInstance);
			if (this.existsById(receiptInstance._id)) {
				return receiptInstance;
			} else {
				throw new Error(`Receipt with id ${receiptInstance._id} could not be created`);
			}
		} else {
			throw new Error(`Receipt with id ${receiptInstance._id} already exists`);
		}
	}
}

// ! Exports
export default ReceiptDAO;
