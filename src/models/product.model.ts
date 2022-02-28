// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { productPropertiesInterface } from './interfaces/product.interface';

// ! Model's Schema Definition
const productSchema: Schema = new Schema<productPropertiesInterface>({
	name: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	imagesURL: { type: [String], required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
	stock: { type: [Number], required: true },
	colors: { type: [String], required: false },
	memory: { type: Number, required: false },
	categoryId: { type: Number, required: true },
});

// ! Model Instance
const ProductsModel = model<productPropertiesInterface>('products', productSchema);

// ! Exports
export default ProductsModel;
