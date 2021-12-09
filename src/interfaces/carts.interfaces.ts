// ! Imports
// * Modules
import mongoose from '../utils/mongodb';

// ! Interfaces
interface cartPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	products: cartProductsInterface[];
	total: number;
	timeStamp: Date;
	state: boolean;
}
interface cartProductsInterface {
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
}

// ! Exports
export { cartProductsInterface, cartPropertiesInterface}