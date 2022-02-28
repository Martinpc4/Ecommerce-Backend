// ! Imports
// * Modules
import { Router } from 'express';
// * Controllers
import ProductsController from '../../controllers/product.controller';
// * Middleware
import isAdmin from '../middlewares/isAdmin.middleware';

// ! Route Definition

// * API Router
const PRODUCTS: Router = Router();

// * API Routes
PRODUCTS.get('/', ProductsController.getAllProducts);
PRODUCTS.get('/category/:categoryId', ProductsController.getByCategory);
PRODUCTS.get('/:productId', ProductsController.getProduct);
PRODUCTS.post('/', isAdmin, ProductsController.addProduct);
PRODUCTS.put('/:productId', isAdmin, ProductsController.modifyProduct);
PRODUCTS.delete('/:productId', isAdmin, ProductsController.deleteProduct);

// ! Exports
export default PRODUCTS;
