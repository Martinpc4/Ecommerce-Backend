// ! Imports
// * Interfaces
import { cartPropertiesInterface } from '../interfaces/carts.interfaces';
// * Utils
import mongoose from '../utils/mongodb';

// ! Model's Schema
const cartSchema: mongoose.Schema = new mongoose.Schema<cartPropertiesInterface>({
    products: { type: [{}], required: true, default: [] },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    timeStamp: { type: Date, required: true, default: new Date() },
    total: {type: Number, required: true, default: 0},
    state: {type: Boolean, required: true, default: true}
});

// ! Model Instance
const CartModel = mongoose.model<cartPropertiesInterface>('carts', cartSchema);

// ! Exports
export default CartModel;