// ! Imports
// * DTOs
import { CartProductClass } from '../models/DTOs/product.dto';
import { ReceiptClass } from '../models/DTOs/receipt.dto';
// * Interfaces
import { Request, Response } from 'express';
import { cartProductsInterface } from '../models/interfaces/product.interface';
import { Types } from 'mongoose';
// * Logs
import logger from '../server/logs/index.logs';
// * Services
import CartService from '../services/cart.service';
import ProductService from '../services/product.service';
import ReceiptService from '../services/receipt.service';
import UserService from '../services/user.service';

// ! Controller Definition
class CartControllerClass {
	async createCart(req: Request, res: Response): Promise<void> {
		try {
			if (req.body === undefined) {
				logger.notice({
					message: `Someone tried to create a cart with no products`,
					router: 'CART',
					method: 'POST',
					route: '/',
				});
				res.status(400).send('No products were sent');
			} else {
				const userInstance: any | undefined = req.user;
				if (req.user === undefined) {
					throw new Error('Internal Server Error: Unauthorized user access');
				}
				if (
					(await UserService.existsById(userInstance._id)) &&
					(await UserService.existsCartLinkedById(userInstance._id)) === null
				) {
					let userProductsValidated: CartProductClass[] = [];
					const userProductsNotValidated: cartProductsInterface[] = req.body.userProducts;
					if (userProductsNotValidated !== undefined) {
						for (const product of userProductsNotValidated) {
							if (await ProductService.isValidProduct(product)) {
								userProductsValidated = [
									...userProductsValidated,
									await ProductService.getValidProduct(
										product._id,
										product.amount,
										product.color,
										product.memory
									),
								];
							} else {
								throw new Error(`Product [${product._id}] is not valid`);
							}
						}
					}

					logger.http({
						message: `Cart created for user ${userInstance._id}`,
						router: 'CART',
						route: '/',
						method: 'POST',
					});
					await CartService.createCart(userInstance._id, userProductsValidated);
					res.status(200).send('Cart was successfully created');
				} else {
					logger.notice({
						message: 'User does not exists or already has a cart',

						router: 'CART',
						method: 'POST',
						route: '/',
					});
					res.status(406).send('User does not exists or already has a cart');
				}
			}
		} catch (err) {
			logger.error({
				message: 'Cart creation failed',
				router: 'CART',
				method: 'GET',
				route: '/',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async deleteCart(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			if (await CartService.exists(userInstance.cartId)) {
				await CartService.removeCartById(userInstance.cartId);
				if (!(await CartService.exists(userInstance.cartId))) {
					await UserService.linkCartToUserById(userInstance._id, null);
					logger.http({
						message: `Cart (id: ${userInstance.cartId}) has been deleted`,
						router: 'CART',
						method: 'DELETE',
						route: '/:cartId',
					});
					res.status(200).send();
				} else {
					logger.notice({
						message: `Cart (id: ${userInstance.cartId}) could not be deleted`,
						router: 'CART',
						method: 'DELETE',
						route: '/:cartId',
					});
					res.status(500).send('Internal Server Error: Cart was not deleted');
				}
			} else {
				logger.notice({
					message: `Cart with id: ${userInstance.cartId} has not been found`,
					router: 'CART',
					route: '/:cartId',
					method: 'DELETE',
				});
				res.status(404).send(`cart with id: ${userInstance.cartId} has not been found`);
			}
		} catch (err) {
			logger.error({
				message: 'Cart deletion failed',
				router: 'CART',
				method: 'DELETE',
				route: '/:cartId',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async getProducts(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			if (await CartService.exists(userInstance.cartId)) {
				const productsArray: cartProductsInterface[] = await CartService.getAllProductsFromCartById(
					userInstance.cartId
				);
				logger.http({
					message: `Products from cart (id: ${userInstance.cartId}) have been retrieved`,
					router: 'CART',
					method: 'GET',
					route: '/:cartId/products',
				});
				res.status(200).json(productsArray);
			} else {
				logger.notice({
					message: `Cart with id: ${userInstance.cartId} has not been found`,
					router: 'CART',
					route: '/:cartId/products',
					method: 'GET',
				});
				res.status(404).send(`Cart with id: ${userInstance.cartId} has not been found`);
			}
		} catch (err) {
			logger.error({
				message: 'Cart retrieval failed',
				router: 'CART',
				method: 'GET',
				route: '/:cartId/products',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async getProduct(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			const productProperties: cartProductsInterface = req.body;
			if (await CartService.exists(userInstance.cartId)) {
				const productFromCart: CartProductClass | null = await CartService.getProductByIdFromCart(
					userInstance.cartId,
					new Types.ObjectId(req.params.productId),
					productProperties.color
				);
				if (productFromCart !== null) {
					logger.http({
						message: `Product (id: ${req.params.productId}) from cart (id: ${userInstance.cartId}) has been retrieved`,
						router: 'CART',
						method: 'GET',
						route: '/:cartId/products/:productId',
					});
					res.status(200).json(productFromCart);
				} else {
					logger.notice({
						message: `Product (id: ${req.params.productId}) has not been found`,
						router: 'CART',
						method: 'GET',
						route: '/:cartId/products/:productId',
					});
					res.status(500).send("Could not retrieve product from user's cart");
				}
			} else {
				logger.notice({
					message: `Cart with id: ${userInstance.cartId} has not been found`,
					router: 'CART',
					route: '/:cartId/products/:productId',
					method: 'GET',
				});
				res.status(404).json({
					success: false,
					message: `Cart with id: ${userInstance.cartId} has not been found`,
				});
			}
		} catch (err) {
			logger.error({
				message: 'Specific product retrieval from cart retrieval failed',
				router: 'CART',
				method: 'GET',
				route: '/:cartId/products/:productId',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async modifyProduct(req: Request, res: Response): Promise<void> {
		const productId: Types.ObjectId = new Types.ObjectId(req.params.productId);
		const userProduct: cartProductsInterface = new CartProductClass(req.body);
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			if (
				(await CartService.exists(userInstance.cartId)) &&
				(await CartService.getProductByIdFromCart(userInstance.cartId, productId, userProduct.color)) !== null
			) {
				const isValid: boolean = await ProductService.isValidProduct(userProduct);
				if (isValid) {
					const flagVar: boolean = await CartService.modifyProductInCartById(
						userInstance.cartId,
						userProduct._id,
						userProduct.color,
						userProduct.memory,
						userProduct.amount
					);
					if (flagVar) {
						logger.http({
							message: `Product [_id: ${productId}] has been modified to Cart [_id: ${userInstance.cartId}]`,
							router: 'CART',
							method: 'PUT',
							route: '/products/:productId',
						});
						res.status(200).send(`Product [_id: ${productId}] has been modified in user's cart`);
					} else {
						logger.error({
							message: `Product [_id: ${productId}] modification to cart [_id: ${userInstance.cartId}] failed`,
							router: 'CART',
							method: 'PUT',
							route: '/products/:productId',
						});
						res.status(500).send(
							`Product [_id: ${productId}] from user's cart modification failed, could not be modified in database`
						);
					}
				} else {
					logger.notice({
						message: '[POST] Product is not valid',
						router: 'CART',
						method: 'PUT',
						route: '/products/:productId',
					});
					res.status(400).json({
						success: false,
						message: 'Product sent is not valid',
					});
				}
			} else {
				logger.notice({
					message: `User's cart could not be found or Product does not exists in User's cart`,
					router: 'CART',
					method: 'PUT',
					route: '/:cartId/products/:productId',
				});
				res.status(404).send(`User's cart could not be found or Product does not exists in User's cart`);
			}
		} catch (err) {
			logger.error({
				message: `Product [_id: ${productId}] modification to cart failed`,
				router: 'CART',
				method: 'PUT',
				route: '/:cartId/products/:productId',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async addProduct(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			req.body._id = new Types.ObjectId(req.body._id);
			const userProductNotValidated: CartProductClass = new CartProductClass(req.body);
			if (
				(await CartService.exists(userInstance.cartId)) &&
				(await ProductService.isValidProduct(userProductNotValidated))
			) {
				if (
					await CartService.isProductInCartById(
						userInstance.cartId,
						userProductNotValidated._id,
						userProductNotValidated.color,
						userProductNotValidated.memory
					)
				) {
					logger.notice({
						message: `Cart [_id: ${userInstance.cartId}] already contains Product [_id: ${userProductNotValidated._id}]`,
						router: 'CART',
						route: '/:cartId/products',
						method: 'POST',
					});
					res.status(400).send(
						`User's cart already contains the Product [_id: ${userProductNotValidated._id}]`
					);
				} else {
					const flagVar = await CartService.addProductToCartById(
						userInstance.cartId,
						userProductNotValidated._id,
						userProductNotValidated.amount,
						userProductNotValidated.color,
						userProductNotValidated.memory
					);

					if (flagVar) {
						logger.notice({
							message: `Product [_id: ${userProductNotValidated._id}] has been added to Cart [_id: ${userInstance.cartId}]`,
							router: 'CART',
							route: '/:cartId/products',
							method: 'POST',
						});
						res.status(200).send(
							`Product [_id: ${userProductNotValidated._id}] has been added to user's Cart`
						);
					} else {
						logger.notice({
							message: `[POST] Product [_id: ${userProductNotValidated._id}] was not added to Cart [_id: ${userInstance.cartId}]`,
							router: 'CART',
							method: 'POST',
							route: '/:cartId/products',
						});
						res.status(500).send(
							`Product [_id: ${userProductNotValidated._id}] could not added to user's cart`
						);
					}
				}
			} else {
				logger.notice({
					message: `User's cart could not been found or the desired product is not valid `,
					router: 'CART',
					route: '/:cartId/products',
					method: 'POST',
				});
				res.status(404).send(`User's cart could not been found or the desired product is not valid`);
			}
		} catch (err) {
			logger.error({
				message: `Product addition to cart failed`,
				router: 'CART',
				method: 'POST',
				route: '/:cartId/products',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async deleteProduct(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			const productId: Types.ObjectId = new Types.ObjectId(req.params.productId);
			if ((await CartService.exists(userInstance.cartId)) && (await ProductService.existsById(productId))) {
				if (req.body.color === undefined || req.body.memory === undefined) {
					res.status(400).send("Not enough information to delete product from user's cart");
				} else {
					if (
						!(await CartService.isProductInCartById(
							userInstance.cartId,
							productId,
							req.body.color,
							req.body.memory
						))
					) {
						logger.notice({
							message: `Product does not exists in user's cart`,
							router: 'CART',
							method: 'DELETE',
							route: '/:cartId/products/:productId',
						});
						res.status(404).send(`Product does not exists in user's cart`);
					} else {
						const validatedProduct: CartProductClass = await ProductService.getValidProduct(
							productId,
							req.body.amount,
							req.body.color,
							req.body.memory
						);
						const flagVar: boolean = await CartService.removeProductFromCartById(
							userInstance.cartId,
							validatedProduct._id,
							validatedProduct.color,
							validatedProduct.memory
						);

						if (flagVar) {
							logger.notice({
								message: `Product [_id: ${validatedProduct._id}] has been removed from Cart [_id: ${userInstance.cartId}]`,
								router: 'CART',
								route: '/:cartId/products',
								method: 'DELETE',
							});
							res.status(200).send("Product has been removed from user's cart");
						} else {
							logger.notice({
								message: `Product could not be removed from Cart`,
								router: 'CART',
								route: '/:cartId/products',
								method: 'DELETE',
							});
							res.status(500).send('Product could not be removed from Cart');
						}
					}
				}
			} else {
				logger.notice({
					message: "User's cart or the desired product were not been found",
					router: 'CART',
					route: '/:cartId/products/:productId',
					method: 'DELETE',
				});
				res.status(404).send("User's cart or the desired product were not been found");
			}
		} catch (err) {
			logger.error({
				message: `Product removal from cart failed`,
				router: 'CART',
				method: 'DELETE',
				route: '/:cartId/products/:productId',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async emptyCart(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			if (await CartService.exists(userInstance.cartId)) {
				await CartService.emptyCartById(userInstance.cartId);
				if ((await CartService.getAllProductsFromCartById(userInstance.cartId)).length === 0) {
					logger.notice({
						message: "All products has been removed from user's cart",
						router: 'CART',
						method: 'DELETE',
						route: '/:cartId/products',
					});
					res.status(200).send("All products has been removed from user's cart");
				} else {
					logger.notice({
						message: `Products could not be removed from user's cart`,
						router: 'CART',
						method: 'DELETE',
						route: '/:cartId/products',
					});
					res.status(500).send("Products could not be removed from user's cart");
				}
			} else {
				logger.notice({
					message: `User's cart could not be removed`,
					router: 'CART',
					method: 'DELETE',
					route: '/:cartId/products',
				});
				res.status(404).send("User's cart could not be removed");
			}
		} catch (err) {
			logger.error({
				message: `Product removal from cart failed`,
				router: 'CART',
				method: 'DELETE',
				route: '/:cartId/products',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
	async checkout(req: Request, res: Response): Promise<void> {
		try {
			const userInstance: any | undefined = req.user;
			if (userInstance === undefined) {
				throw new Error('Internal Server Error: Unauthorized user access');
			}
			if (
				(await CartService.exists(userInstance.cartId)) &&
				(await CartService.getAllProductsFromCartById(userInstance.cartId)).length > 0 &&
				(await UserService.isEmailVerified(userInstance._id))
			) {
				if (!(await CartService.validateStock(userInstance.cartId))) {
					logger.notice({
						message: `User's cart does not have enough stock`,
						router: 'CART',
						method: 'POST',
						route: '/checkout',
					});
					res.status(400).send("User's cart does not have enough stock");
				} else {
					const receiptInstance: ReceiptClass = await ReceiptService.createReceipt(
						userInstance.cartId,
						userInstance._id
					);
					logger.http({
						message: "User's cart has been checkout",
						router: 'CART',
						method: 'POST',
						route: '/:cartId/checkout/:userId',
					});
					res.status(200).json({
						receiptInstance,
						message: "User's cart has been checkout",
					});
				}
			} else {
				logger.http({
					message: "User's cart does not exist, is empty or User's email is not verified",
					router: 'CART',
					method: 'POST',
					route: '/:cartId/checkout/:userId',
				});
				res.status(404).send("User's cart does not exist, is empty or User's email is not verified");
			}
		} catch (err) {
			logger.error({
				message: `Cart checkout failed`,
				router: 'CART',
				method: 'POST',
				route: '/:cartId/checkout',
				stack: err,
			});
			res.status(500).send(err);
		}
	}
}

// ! Controller Instance
const CartController = new CartControllerClass();

// ! Exports
export default CartController;
