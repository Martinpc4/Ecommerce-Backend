// ! Imports
// * DAOs
import CartMemoryDAO from '../DAOs/cart.memory.dao';
import CartMongooseDAO from '../DAOs/cart.mongoose.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definition
const storageOption: string = arguments.storage;

let CartDAO: CartMemoryDAO | CartMongooseDAO;

if (storageOption === 'mongoose') {
	CartDAO = new CartMongooseDAO();
} else {
	CartDAO = new CartMemoryDAO();
}

// ! Exports
export default CartDAO;
