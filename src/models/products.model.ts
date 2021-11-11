import mongoose from '../mongodb';
import { productProperties } from '../interfaces/controller.interfaces';

const productSchema: mongoose.Schema = new mongoose.Schema<productProperties>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imagesURL: { type: [String], required: true },
    timeStamp: { type: Date, required: true, default: new Date() },
    stock: { type: Number, required: true },
});

const ProductModel = mongoose.model<productProperties>(
    'products',
    productSchema
);

export default ProductModel;
