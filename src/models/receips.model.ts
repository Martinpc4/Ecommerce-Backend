// ! Imports
// * Types
import { receiptPropertiesInterface } from '../interfaces/receipt.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Model's Schema Defintion
const receiptSchema: mongoose.Schema = new mongoose.Schema<receiptPropertiesInterface>({
	_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
	userId: { type: mongoose.SchemaTypes.ObjectId, required: true },
	cartId: { type: mongoose.SchemaTypes.ObjectId, required: true },
	total: { type: Number, required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
});

// ! Model's Instance
const ReceiptsModel = mongoose.model<receiptPropertiesInterface>('receipts', receiptSchema);

// ! Exports
export default ReceiptsModel;
