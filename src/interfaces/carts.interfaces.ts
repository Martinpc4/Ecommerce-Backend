// ! Imports
// * Modules
import mongoose from '../services/mongodb.services';
// * Types
import { cartProductsInterface } from './products.interfaces';

// ! Interface Definition
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
