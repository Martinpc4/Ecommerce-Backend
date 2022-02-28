// ! Imports
// * DTOs
import { ReceiptClass } from '../DTOs/receipt.dto';
// * Interfaces
import { receiptPropertiesInterface } from '../interfaces/receipt.interface';
import { Types } from 'mongoose';
// * Models
import ReceiptsModel from '../receipt.model';

// ! DAO Definition
class ReceiptDAO {
	async existsById(receiptId: Types.ObjectId): Promise<boolean> {
		return (await ReceiptsModel.findById(receiptId)) !== null;
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

// ! Exports
export default ReceiptDAO;
