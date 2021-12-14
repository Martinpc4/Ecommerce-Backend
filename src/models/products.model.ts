// ! Imports
// * Interfaces
import { productPropertiesInterface } from '../interfaces/products.interfaces';
// * Config
import mongoose from '../config/mongodb.config';

// ! Model's Schema
const productSchema: mongoose.Schema = new mongoose.Schema<productPropertiesInterface>({
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
const ProductsModel = mongoose.model<productPropertiesInterface>('products', productSchema);

// ! Exports
export default ProductsModel;
