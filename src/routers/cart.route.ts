// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Controllers
import CartsController from '../controllers/cart.controller';
import ProductsController from '../controllers/product.controller';
import ReceiptsController from '../controllers/receipt.controller';
import UsersController from '../controllers/user.controller';
// * Classes
import { CartProductClass } from '../classes/products.classes';
import { ReceiptClass } from '../classes/receipts.class';
// * Interfaces
import { cartProductsInterface } from '../interfaces/carts.interfaces';
import { productPropertiesInterface } from '../interfaces/products.interfaces';
// * Models
import ProductModel from '../models/products.model';
// * Utils
import mongoose from '../utils/mongodb';
// * Loggers
import logger from '../logs/index.logs';
// * Middlewares
import isAuthenticated from '../middlewares/isAuthenticated.middleware';

// ! Route Definition

// * CART Router
const CART: Router = Router();

// * CART Routes
// Create new cart
CART.post('/', async (req: Request, res: Response) => {
	let errorMessages: string[] = [];
	try {
		if (req.body.userId === undefined || req.body.userProducts === undefined) {
			logger.notice({
				message: `Someone tried to create a cart with missing information`,
				router: 'CART',
				method: 'POST',
				route: '/',
			});
			res.status(404).json({
				success: false,
				message: 'User does not exists or already has a cart',
			});
		}
		const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.body.userId);
		const userProductsNotValidated: cartProductsInterface[] = req.body.userProducts;
		if (
			(await UsersController.isUserById(userId)) === true &&
			(await UsersController.existsCartLinkedById(userId)) === null
		) {
			let userProductsValidated: cartProductsInterface[] = [];
			let flagVar: boolean = true;

			for await (const product of userProductsNotValidated) {
				const productData: productPropertiesInterface | null = await ProductModel.findById(product._id);
				if (productData == null) {
					flagVar = false;
					throw new Error('Internal server error');
				}
				if (productData.colors.indexOf(product.color) === -1) {
					flagVar = false;
					errorMessages.push(`Product [id: ${product._id}] does not posses the ${product.color} color`);
				}
				if (productData.memory !== product.memory) {
					flagVar = false;
					errorMessages.push(`Product [id: ${product._id}] does not posses the ${product.memory} memory`);
				}
				if (productData.stock[productData.colors.indexOf(product.color)] <= product.amount) {
					flagVar = false;
					errorMessages.push(`Product [id: ${product._id}] does not posses enough stock`);
				}

				userProductsValidated = [
					...userProductsValidated,
					new CartProductClass({
						_id: productData._id,
						name: productData.name,
						description: productData.description,
						price: productData.price,
						imagesURL: productData.imagesURL,
						timeStamp: productData.timeStamp,
						memory: productData.memory,
						categoryId: productData.categoryId,
						color: product.color,
						amount: product.amount,
					}),
				];
			}

			if (flagVar) {
				logger.http({
					message: `Cart created for user ${userId}`,
					router: 'CART',
					route: '/',
					method: 'POST',
				});
				res.status(200).json({
					success: true,
					cartProperties: await CartsController.createCart(userId, userProductsValidated),
				});
			} else {
				throw new Error(String(errorMessages));
			}
		} else {
			logger.notice({
				message: 'User does not exists or already has a cart',

				router: 'CART',
				method: 'POST',
				route: '/',
			});
			res.status(500).json({
				success: false,
				message: 'User does not exists or already has a cart',
			});
		}
	} catch (err) {
		logger.error({
			message: 'Cart creation failed',
			errorMessages,
			router: 'CART',
			method: 'GET',
			route: '/',
			stack: err,
		});
		res.status(500).send(`[POST] Create new cart:\n\n${err}`);
	}
});
// Delete a cart
CART.delete('/:cartId', async (req: Request, res: Response) => {
	try {
		const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
		if ((await CartsController.exists(cartId)) === true) {
			await CartsController.removeCartById(cartId);
			if ((await CartsController.exists(cartId)) === false) {
				logger.http({
					message: `Cart (id: ${cartId}) has been deleted`,
					router: 'CART',
					method: 'DELETE',
					route: '/:cartId',
				});
				res.status(200).json({ success: true });
			} else {
				logger.notice({
					message: `Cart (id: ${cartId}) could not be deleted`,
					router: 'CART',
					method: 'DELETE',
					route: '/:cartId',
				});
				res.status(500).json({
					success: false,
					message: '[DELETE] Internal server error, cart not deleted',
				});
			}
		} else {
			logger.notice({
				message: `Cart with id: ${cartId} has not been found`,
				router: 'CART',
				route: '/:cartId',
				method: 'DELETE',
			});
			res.status(404).json({
				success: false,
				message: `cart with id: ${cartId} has not been found`,
			});
		}
	} catch (err) {
		logger.error({
			message: 'Cart deletion failed',
			router: 'CART',
			method: 'DELETE',
			route: '/:cartId',
			stack: err,
		});
		res.status(500).send(`[DELETE] Delete cart by Id:\n\n${err}`);
	}
});
// Get all products from a cart
CART.get('/:cartId/products', async (req: Request, res: Response) => {
	try {
		if (mongoose.isValidObjectId(req.params.cartId) && req.params.cartId !== undefined) {
			const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
			if (await CartsController.exists(cartId)) {
				const productsArray: cartProductsInterface[] = await CartsController.getAllProductsFromCartById(cartId);
				logger.http({
					message: `Products from cart (id: ${cartId}) have been retrieved`,
					router: 'CART',
					method: 'GET',
					route: '/:cartId/products',
				});
				res.status(200).json({ products: productsArray });
			} else {
				logger.notice({
					message: `Cart with id: ${cartId} has not been found`,
					router: 'CART',
					route: '/:cartId/products',
					method: 'GET',
				});
				res.status(404).json({
					success: false,
					message: `cart with id: ${cartId} has not been found`,
				});
			}
		} else {
			logger.notice({
				message: 'Object id is not valid or missing data',
				router: 'CART',
				route: '/:cartId/products',
				method: 'GET',
			});
			res.status(404).json({
				success: false,
				message: 'Object id is not valid or missing data',
			});
		}
	} catch (err) {
		logger.error({
			message: 'Cart retrieval failed',
			router: 'CART',
			method: 'GET',
			route: '/:cartId/products',
			stack: err,
		});
		res.status(500).send(`[GET] Get cart by Id:\n\n${err}`);
	}
});
// Modify products in a Cart
CART.put('/:cartId/products/:productId', async (req: Request, res: Response) => {
	const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
	const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
	req.body._id = productId;
	const userProduct: cartProductsInterface = new CartProductClass(req.body);
	try {
		if (await CartsController.exists(cartId)) {
			const flagVar: boolean = await ProductsController.isValidProduct(userProduct);
			if (flagVar) {
				const flagVar: boolean = await CartsController.modifyProductInCartById(
					cartId,
					userProduct._id,
					userProduct.color,
					userProduct.memory,
					userProduct.amount
				);
				if (flagVar) {
					logger.http({
						message: `Product [_id: ${productId}] has been modified to Cart [_id: ${cartId}]`,
						router: 'CART',
						method: 'PUT',
						route: '/:cartId/products/:productId',
					});
					res.status(200).json({
						success: true,
						message: `Product [_id: ${productId}] has been modified to Cart [_id: ${cartId}]`,
					});
				} else {
					logger.error({
						message: `Product [_id: ${productId}] modification to cart [_id: ${req.params.cartId}] failed`,
						router: 'CART',
						method: 'PUT',
						route: '/:cartId/products/:productId',
					});
					res.status(500).send(
						`Product [_id: ${productId}] modification to cart [_id: ${req.params.cartId}] failed`
					);
				}
			} else {
				logger.notice({
					message: '[POST] Product is not valid',
					router: 'CART',
					method: 'PUT',
					route: '/:cartId/products/:productId',
				});
				res.status(404).json({
					success: false,
					message: '[POST] Product is not valid',
				});
			}
		} else {
			logger.notice({
				message: `[POST] Cart [_id: ${cartId}] was not found`,
				router: 'CART',
				method: 'PUT',
				route: '/:cartId/products/:productId',
			});
			res.status(404).send(`[POST] Cart [_id: ${cartId}] was not found`);
		}
	} catch (err) {
		logger.error({
			message: `Product [_id: ${productId}] modification to cart [_id: ${req.params.cartId}] failed`,
			router: 'CART',
			method: 'PUT',
			route: '/:cartId/products/:productId',
			stack: err,
		});
		res.status(500).send(
			`Product [_id: ${productId}] modification to cart [_id: ${req.params.cartId}] failed\n\n${err}`
		);
	}
});
// Add a Product to Cart
CART.post('/:cartId/products/', async (req: Request, res: Response) => {
	try {
		req.body._id = new mongoose.Types.ObjectId(req.body._id);
		const userProductNotValidated: cartProductsInterface = new CartProductClass(req.body);
		const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
		if (
			(await CartsController.exists(cartId)) &&
			(await ProductsController.isValidProduct(userProductNotValidated))
		) {
			if (
				await CartsController.isProductInCartById(
					cartId,
					userProductNotValidated._id,
					userProductNotValidated.color,
					userProductNotValidated.memory
				)
			) {
				logger.notice({
					message: `Cart [_id: ${cartId}] already contains Product [_id: ${userProductNotValidated._id}]`,
					router: 'CART',
					route: '/:cartId/products',
					method: 'POST',
				});
				res.status(400).json({
					success: false,
					message: `Cart [_id: ${cartId}] already contains Product [_id: ${userProductNotValidated._id}]`,
				});
			} else {
				const flagVar = await CartsController.addProductToCartById(
					cartId,
					userProductNotValidated._id,
					userProductNotValidated.amount,
					userProductNotValidated.color,
					userProductNotValidated.memory
				);

				if (flagVar) {
					logger.notice({
						message: `Product [_id: ${userProductNotValidated._id}] has been added to Cart [_id: ${cartId}]`,
						router: 'CART',
						route: '/:cartId/products',
						method: 'POST',
					});
					res.status(200).json({
						success: true,
						message: `Product [_id: ${userProductNotValidated._id}] has been added to Cart [_id: ${cartId}]`,
					});
				} else {
					logger.notice({
						message: `[POST] Product [_id: ${userProductNotValidated._id}] was not added to Cart [_id: ${cartId}]`,
						router: 'CART',
						method: 'POST',
						route: '/:cartId/products',
					});
					res.status(505).json({
						success: false,
						message: `Product [_id: ${userProductNotValidated._id}] was not added to Cart [_id: ${cartId}]`,
					});
				}
			}
		} else {
			logger.notice({
				message: `Cart [_id: ${cartId}] has not been found or Product [_id: ${userProductNotValidated._id}] does not exist`,
				router: 'CART',
				route: '/:cartId/products',
				method: 'POST',
			});
			res.status(404).json({
				success: false,
				message: `Cart [_id: ${cartId}] has not been found or Product [_id: ${userProductNotValidated._id}] does not exist`,
			});
		}
	} catch (err) {
		logger.error({
			message: `Product addition to cart (id: ${req.params.cartId}) failed`,
			router: 'CART',
			method: 'POST',
			route: '/:cartId/products',
			stack: err,
		});
		res.status(500).send(`[POST] Add or Modify product to the Cart by Id:\n\n${err}`);
	}
});
// Delete a Product from CArt
CART.delete('/:cartId/products/:productId/', async (req: Request, res: Response) => {
	try {
		const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
		const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
		if ((await CartsController.exists(cartId)) && (await ProductsController.exists(productId))) {
			if (req.body.color === undefined || req.body.memory === undefined) {
				res.status(500).json({
					success: false,
					message: `[DELTE] Not enough data to delete product from cart`,
				});
			} else {
				if (!(await CartsController.isProductInCartById(cartId, productId, req.body.color, req.body.memory))) {
					logger.notice({
						message: `Product [id: ${productId}] does not exists in Cart [_id: ${cartId}]`,
						router: 'CART',
						method: 'DELETE',
						route: '/:cartId/products/:productId',
					});
					res.status(404).json({
						success: false,
						message: `Product [id: ${productId}] does not exists in Cart [_id: ${cartId}]`,
					});
				} else {
					const validatedProduct: CartProductClass = await ProductsController.getValidProduct(
						productId,
						req.body.amount,
						req.body.color,
						req.body.memory
					);
					const flagVar: boolean = await CartsController.removeProductFromCartById(
						cartId,
						validatedProduct._id,
						validatedProduct.color,
						validatedProduct.memory
					);

					if (flagVar) {
						logger.notice({
							message: `Product [_id: ${validatedProduct._id}] has been removed from Cart [_id: ${cartId}]`,
							router: 'CART',
							route: '/:cartId/products',
							method: 'DELETE',
						});
						res.status(200).json({
							success: true,
							message: `Product [_id: ${validatedProduct._id}] has been removed from Cart [_id: ${cartId}]`,
						});
					} else {
						logger.notice({
							message: `Product [_id: ${validatedProduct._id}] was not removed from Cart [_id: ${cartId}]`,
							router: 'CART',
							route: '/:cartId/products',
							method: 'DELETE',
						});
						res.status(500).json({
							success: false,
							message: `Product [_id: ${validatedProduct._id}] was not removed from Cart [_id: ${cartId}]`,
						});
					}
				}
			}
		} else {
			logger.notice({
				message: `Cart [_id: ${cartId}] or Product [_id: ${productId}] has not been found`,
				router: 'CART',
				route: '/:cartId/products/:productId',
				method: 'DELETE',
			});
			res.status(404).json({
				success: false,
				message: `Cart [_id: ${cartId}] or Product [_id: ${productId}] has not been found`,
			});
		}
	} catch (err) {
		logger.error({
			message: `Product removal from cart (id: ${req.params.cartId}) failed`,
			router: 'CART',
			method: 'DELETE',
			route: '/:cartId/products/:productId',
			stack: err,
		});
		res.status(500).send(`[DELTE] Delete product in Cart by Id:\n\n${err}`);
	}
});
// Checkout a Cart
CART.post('/:cartId/checkout/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		if (req.params.cartId === undefined || req.params.userId === undefined) {
			res.status(500).json({
				success: false,
				message: `[POST] Not enough data to checkout cart`,
			});
		}
		const cartId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.cartId);
		const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.userId);
		if (
			(await CartsController.exists(cartId)) &&
			(await CartsController.getAllProductsFromCartById(cartId)) !== [] &&
			(await UsersController.isEmailVerified(userId))
		) {
			const receiptInstance: ReceiptClass = await ReceiptsController.createReceipt(cartId, userId);
			logger.http({
				message: `Cart [_id: ${cartId}] has been checked out`,
				router: 'CART',
				method: 'POST',
				route: '/:cartId/checkout/:userId',
			});
			res.status(200).json({
				success: true,
				message: `Cart [_id: ${cartId}] has been checked out`,
				receipt: receiptInstance,
			});
		} else {
			logger.http({
				message: `Cart [_id: ${cartId}] has not been found`,
				router: 'CART',
				method: 'POST',
				route: '/:cartId/checkout/:userId',
			});
			res.status(404).json({
				success: false,
				message: `Cart [_id: ${cartId}] does not exist, is empty or User [_id: ${userId}] email is not verified`,
			});
		}
	} catch (err) {
		logger.error({
			message: `Cart checkout failed`,
			router: 'CART',
			method: 'POST',
			route: '/:cartId/checkout',
			stack: err,
		});
		res.status(500).send(`[POST] Cart checkout failed:\n\n${err}`);
	}
});

// ! Exports
export default CART;
