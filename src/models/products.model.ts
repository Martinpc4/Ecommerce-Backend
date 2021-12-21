// ! Imports
// * Types
import { productPropertiesInterface } from '../interfaces/products.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Model's Schema Defintion
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
