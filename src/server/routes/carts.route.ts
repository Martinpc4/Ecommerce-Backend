// ! Imports
// * Modules
import { Router } from 'express';
// * Auth
import passport from '../../auth/passport.auth';
// * Controllers
import CartController from '../../controllers/cart.controller';

// ! Route Definition
// * CARTS Router
const CARTS: Router = Router();

// * CARTS Routes
const passportJWT = passport.authenticate('jwt', { session: false });
// Create new cart
CARTS.post('/', passportJWT, CartController.createCart);
// Delete a cart
CARTS.delete('/', passportJWT, CartController.deleteCart);
// Get all products from a cart
CARTS.get('/products', passportJWT, CartController.getProducts);
// Get specific product from Cart
CARTS.post('/products/:productId', passportJWT, CartController.getProduct);
// Modify product in a Cart
CARTS.put('/products/:productId', passportJWT, CartController.modifyProduct);
// Add a Product to Cart
CARTS.post('/products', passportJWT, CartController.addProduct);
// Delete a Product from Cart
CARTS.delete('/products/:productId', passportJWT, CartController.deleteProduct);
// Delete all products
CARTS.delete('/products', passportJWT, CartController.emptyCart);
// Checkout a Cart
CARTS.post('/checkout', passportJWT, CartController.checkout);

// ! Exports
export default CARTS;
