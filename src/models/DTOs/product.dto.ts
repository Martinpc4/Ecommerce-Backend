// ! Imports
// * Interfaces
import {
	cartProductsInterface,
	genericProductPropertiesInterface,
	productPropertiesInterface,
} from '../interfaces/product.interface';
import { Types } from 'mongoose';

// ! DTOs Definitions
// * Generic Product Class
class GenericProductClass implements genericProductPropertiesInterface {
	_id: Types.ObjectId;
	categoryId: number;
	name: string;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	memory: number;

	constructor(genericProductProperties: genericProductPropertiesInterface) {
		this._id = genericProductProperties._id;
		this.categoryId = genericProductProperties.categoryId;
		this.name = genericProductProperties.name;
		this.description = genericProductProperties.description;
		this.price = genericProductProperties.price;
		this.imagesURL = genericProductProperties.imagesURL;
		this.timeStamp =
			genericProductProperties.timeStamp !== undefined ? genericProductProperties.timeStamp : new Date();
		this.memory = genericProductProperties.memory;
	}
}

// * Cart Product Class
class CartProductClass extends GenericProductClass implements cartProductsInterface {
	color: string;
	amount: number;

	constructor(cartProductProperties: cartProductsInterface) {
		super(cartProductProperties);
		this.amount = cartProductProperties.amount;
		this.color = cartProductProperties.color;
	}
}

// * Product Class
class ProductClass extends GenericProductClass implements productPropertiesInterface {
	stock: number[];
	colors: string[];

	constructor(productProperties: productPropertiesInterface) {
		super(productProperties);
		this.stock = productProperties.stock;
		this.colors = productProperties.colors;
	}
}

// ! Exports
export { ProductClass, CartProductClass };
