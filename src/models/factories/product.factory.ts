// ! Imports
// * DAOs
import ProductMongooseDAO from '../DAOs/product.mongoose.dao';
import ProductMemoryDAO from '../DAOs/product.memory.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definition
const storageOption: string = arguments.storage;

let ProductDAO: ProductMemoryDAO | ProductMongooseDAO;

if (storageOption === 'mongoose') {
	ProductDAO = new ProductMongooseDAO();
} else {
	ProductDAO = new ProductMemoryDAO();
}

// ! Exports
export default ProductDAO;
