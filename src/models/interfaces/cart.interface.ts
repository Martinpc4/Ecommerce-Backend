// ! Imports
// * Modules
import mongoose from '../../services/mongoose.service';
// * Types
import { cartProductsInterface } from './product.interface';

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
