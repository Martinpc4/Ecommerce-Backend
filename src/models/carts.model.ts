import mongoose from '../mongodb';
import { cartProperties } from '../interfaces/controller.interfaces';

const cartSchema: mongoose.Schema = new mongoose.Schema<cartProperties>({
    products: { type: [{}], required: true, default: [] },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        required: true,
    },
    timeStamp: { type: Date, required: true, default: new Date() },
});

const CartModel = mongoose.model<cartProperties>('carts', cartSchema);

export default CartModel;
