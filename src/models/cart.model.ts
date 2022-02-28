// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { cartPropertiesInterface } from './interfaces/cart.interface';

// ! Model's Schema Definition
const cartSchema: Schema = new Schema<cartPropertiesInterface>({
	products: { type: [{}], required: true, default: [] },
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	timeStamp: { type: Date, required: true, default: new Date() },
	total: { type: Number, required: true, default: 0 },
	state: { type: Boolean, required: true, default: true },
});

// ! Model Instance
const CartModel = model<cartPropertiesInterface>('carts', cartSchema);

// ! Exports
export default CartModel;
