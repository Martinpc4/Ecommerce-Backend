// ! Imports
// * Modules
import mongoose from '../utils/mongodb';
// * Interfaces
import { cartProductsInterface } from './products.interfaces';

// ! Interfaces
interface cartPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	products: cartProductsInterface[];
	total: number;
	timeStamp: Date;
	state: boolean;
}

// ! Exports
export { cartPropertiesInterface };
