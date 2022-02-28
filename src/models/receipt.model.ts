// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { receiptPropertiesInterface } from './interfaces/receipt.interface';

// ! Model's Schema Definition
const receiptSchema: Schema = new Schema<receiptPropertiesInterface>({
	_id: { type: Schema.Types.ObjectId, required: true },
	userId: { type: Schema.Types.ObjectId, required: true },
	cartId: { type: Schema.Types.ObjectId, required: true },
	total: { type: Number, required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
});

// ! Model's Instance
const ReceiptsModel = model<receiptPropertiesInterface>('receipts', receiptSchema);

// ! Exports
export default ReceiptsModel;
