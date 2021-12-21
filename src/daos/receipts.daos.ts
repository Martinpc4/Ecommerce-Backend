// ! Imports
// * Classes
import { ReceiptClass } from '../classes/receipts.class';
// * Types
import { receiptPropertiesInterface } from '../interfaces/receipt.interfaces';
// * Models
import ReceiptsModel from '../models/receips.model';
// * Services
import mongoose from '../services/mongodb.services';

// ! Data Access Object Definition
class ReceiptsDAO {
	constructor() {}
	async existsById(receiptId: mongoose.Types.ObjectId): Promise<boolean> {
		if ((await ReceiptsModel.findById(receiptId)) !== null) {
			return true;
		} else {
			return false;
		}
	}
	async create(receiptInstance: ReceiptClass): Promise<ReceiptClass> {
		if (!(await this.existsById(receiptInstance._id))) {
			const receiptDocument: receiptPropertiesInterface = await ReceiptsModel.create(receiptInstance);
			return new ReceiptClass(receiptDocument);
		} else {
			throw new Error(`Receipt with id ${receiptInstance._id} already exists`);
		}
	}
}

// ! Data Access Object Instance
const ReceiptsDAOInstance: ReceiptsDAO = new ReceiptsDAO();

// ! Exports
export default ReceiptsDAOInstance;
