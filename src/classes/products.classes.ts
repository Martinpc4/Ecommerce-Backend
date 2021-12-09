// ! Imports
// * Controllers
import { cartProductsInterface } from '../interfaces/carts.interfaces';
import { productPropertiesInterface } from '../interfaces/products.interfaces';
// * Utils
import mongoose from '../utils/mongodb';

// ! Classes
// * Cart Product Class
class CartProductClass {
	_id: mongoose.Types.ObjectId;
	name: string;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	categoryId: number;
	color: string;
	memory: number;
	amount: number;
	constructor(cartProductProperties: cartProductsInterface) {
		(this._id = cartProductProperties._id),
			(this.name = cartProductProperties.name),
			(this.price = cartProductProperties.price),
			(this.amount = cartProductProperties.amount),
			(this.color = cartProductProperties.color),
			(this.description = cartProductProperties.description),
			(this.imagesURL = cartProductProperties.imagesURL),
			(this.categoryId = cartProductProperties.categoryId),
			(this.timeStamp =
				cartProductProperties.timeStamp !== undefined ? cartProductProperties.timeStamp : new Date()),
			(this.memory = cartProductProperties.memory);
	}
}
// * Product Class
class ProductClass {
	name: string;
	_id: mongoose.Types.ObjectId;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	stock: number[];
	memory: number;
	colors: string[];
	categoryId: number;
	constructor(productProperties: productPropertiesInterface) {
		(this.timeStamp = productProperties.timeStamp !== undefined ? productProperties.timeStamp : new Date()),
			(this.stock = productProperties.stock),
			(this.name = productProperties.name),
			(this._id = productProperties._id),
			(this.description = productProperties.description),
			(this.price = Number(productProperties.price)),
			(this.imagesURL = productProperties.imagesURL),
			(this.memory = Number(productProperties.memory)),
			(this.categoryId = Number(productProperties.categoryId)),
			(this.colors = productProperties.colors);
	}
}

// ! Exports
export { ProductClass, CartProductClass };
