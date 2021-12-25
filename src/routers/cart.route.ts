// ! Imports
// * Modules
import {Request, Response, Router} from 'express';
// * Authentication
import passport from '../auth/passport.auth';
// * Classes
import {CartProductClass} from '../classes/products.classes';
import {ReceiptClass} from '../classes/receipts.class';
// * Controllers
import CartsController from '../controllers/cart.controller';
import ProductsController from '../controllers/product.controller';
import ReceiptsController from '../controllers/receipt.controller';
import UsersController from '../controllers/user.controller';
// * Types
import {cartProductsInterface} from '../interfaces/products.interfaces';
// * Loggers
import logger from '../logs/index.logs';
// * Services
import mongoose from '../services/mongodb.services';

// ! Route Definition

// * CART Router
const CART: Router = Router();

// * CART Routes
// Create new cart
CART.post('/', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    let errorMessages: string[] = [];
    try {
        if (req.body === undefined) {
            logger.notice({
                message: `Someone tried to create a cart with no products`,
                router: 'CART',
                method: 'POST',
                route: '/',
            });
            res.status(404).send('No products were sent');
        } else {
            const userInstance: any | undefined = req.user;
            if (req.user === undefined) {
                throw new Error('Internal Server Error: Unauthorized user access');
            }
            if (
                (await UsersController.existsById(userInstance._id)) &&
                (await UsersController.existsCartLinkedById(userInstance._id)) === null
            ) {
                let userProductsValidated: CartProductClass[] = [];
                const userProductsNotValidated: cartProductsInterface[] = req.body.userProducts;
                if (userProductsNotValidated !== undefined) {
                    for (const product of userProductsNotValidated) {
                        if (await ProductsController.isValidProduct(product)) {
                            userProductsValidated = [
                                ...userProductsValidated,
                                await ProductsController.getValidProduct(
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
                res.status(200).json(await CartsController.createCart(userInstance._id, userProductsValidated));
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
CART.delete('/', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    try {
        const userInstance: any | undefined = req.user;
        if (userInstance === undefined) {
            throw new Error('Internal Server Error: Unauthorized user access');
        }
        if ((await CartsController.exists(userInstance.cartId))) {
            await CartsController.removeCartById(userInstance.cartId);
            if (!(await CartsController.exists(userInstance.cartId))) {
                await UsersController.linkCartToUserById(userInstance._id, null);
                logger.http({
                    message: `Cart (id: ${userInstance.cartId}) has been deleted`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId',
                });
                res.status(200).json({success: true});
            } else {
                console.log(125);
                logger.notice({
                    message: `Cart (id: ${userInstance.cartId}) could not be deleted`,
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
                message: `Cart with id: ${userInstance.cartId} has not been found`,
                router: 'CART',
                route: '/:cartId',
                method: 'DELETE',
            });
            res.status(404).json({
                success: false,
                message: `cart with id: ${userInstance.cartId} has not been found`,
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
CART.get('/products', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    try {
        const userInstance: any | undefined = req.user;
        if (userInstance === undefined) {
            throw new Error('Internal Server Error: Unauthorized user access');
        }
        if (await CartsController.exists(userInstance.cartId)) {
            const productsArray: cartProductsInterface[] = await CartsController.getAllProductsFromCartById(
                userInstance.cartId
            );
            logger.http({
                message: `Products from cart (id: ${userInstance.cartId}) have been retrieved`,
                router: 'CART',
                method: 'GET',
                route: '/:cartId/products',
            });
            res.status(200).json({products: productsArray});
        } else {
            logger.notice({
                message: `Cart with id: ${userInstance.cartId} has not been found`,
                router: 'CART',
                route: '/:cartId/products',
                method: 'GET',
            });
            res.status(404).json({
                success: false,
                message: `cart with id: ${userInstance.cartId} has not been found`,
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
// Get specific product from Cart
CART.post(
    '/products/:productId',
    passport.authenticate('jwt', {session: false}),
    async (req: Request, res: Response) => {
        try {
            const userInstance: any | undefined = req.user;
            if (userInstance === undefined) {
                throw new Error('Internal Server Error: Unauthorized user access');
            }
            const productProperties: cartProductsInterface = req.body;
            if (await CartsController.exists(userInstance.cartId)) {
                const productFromCart: CartProductClass | null = await CartsController.getProductByIdFromCart(
                    userInstance.cartId,
                    new mongoose.Types.ObjectId(req.params.productId),
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
                    res.status(404).json({
                        success: false,
                        message: `Product (id: ${req.params.productId}) has not been found`,
                    });
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
                    message: `cart with id: ${userInstance.cartId} has not been found`,
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
            res.status(500).send(`[GET] Get a specific product from cart by Id:\n\n${err}`);
        }
    }
);
// Modify products in a Cart
CART.put(
    '/products/:productId',
    passport.authenticate('jwt', {session: false}),
    async (req: Request, res: Response) => {
        const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
        const userProduct: cartProductsInterface = new CartProductClass(req.body);
        try {
            const userInstance: any | undefined = req.user;
            if (userInstance === undefined) {
                throw new Error('Internal Server Error: Unauthorized user access');
            }
            if (await CartsController.exists(userInstance.cartId)) {
                const flagVar: boolean = await ProductsController.isValidProduct(userProduct);
                if (flagVar) {
                    const flagVar: boolean = await CartsController.modifyProductInCartById(
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
                        res.status(200).json({
                            success: true,
                            message: `Product [_id: ${productId}] has been modified to Cart [_id: ${userInstance.cartId}]`,
                        });
                    } else {
                        logger.error({
                            message: `Product [_id: ${productId}] modification to cart [_id: ${userInstance.cartId}] failed`,
                            router: 'CART',
                            method: 'PUT',
                            route: '/products/:productId',
                        });
                        res.status(500).send(
                            `Product [_id: ${productId}] modification to cart [_id: ${userInstance.cartId}] failed`
                        );
                    }
                } else {
                    logger.notice({
                        message: '[POST] Product is not valid',
                        router: 'CART',
                        method: 'PUT',
                        route: '/products/:productId',
                    });
                    res.status(404).json({
                        success: false,
                        message: '[POST] Product is not valid',
                    });
                }
            } else {
                logger.notice({
                    message: `[POST] Cart [_id: ${userInstance.cartId}] was not found`,
                    router: 'CART',
                    method: 'PUT',
                    route: '/:cartId/products/:productId',
                });
                res.status(404).send(`[POST] Cart [_id: ${userInstance.cartId}] was not found`);
            }
        } catch (err) {
            logger.error({
                message: `Product [_id: ${productId}] modification to cart failed`,
                router: 'CART',
                method: 'PUT',
                route: '/:cartId/products/:productId',
                stack: err,
            });
            res.status(500).send(`Product [_id: ${productId}] modification to cart failed\n\n${err}`);
        }
    }
);
// Add a Product to Cart
CART.post('/products', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    try {
        const userInstance: any | undefined = req.user;
        if (userInstance === undefined) {
            throw new Error('Internal Server Error: Unauthorized user access');
        }
        req.body._id = new mongoose.Types.ObjectId(req.body._id);
        const userProductNotValidated: CartProductClass = new CartProductClass(req.body);
        if (
            (await CartsController.exists(userInstance.cartId)) &&
            (await ProductsController.isValidProduct(userProductNotValidated))
        ) {
            if (
                await CartsController.isProductInCartById(
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
                res.status(400).json({
                    success: false,
                    message: `Cart [_id: ${userInstance.cartId}] already contains Product [_id: ${userProductNotValidated._id}]`,
                });
            } else {
                const flagVar = await CartsController.addProductToCartById(
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
                    res.status(200).json({
                        success: true,
                        message: `Product [_id: ${userProductNotValidated._id}] has been added to Cart [_id: ${userInstance.cartId}]`,
                    });
                } else {
                    logger.notice({
                        message: `[POST] Product [_id: ${userProductNotValidated._id}] was not added to Cart [_id: ${userInstance.cartId}]`,
                        router: 'CART',
                        method: 'POST',
                        route: '/:cartId/products',
                    });
                    res.status(505).json({
                        success: false,
                        message: `Product [_id: ${userProductNotValidated._id}] was not added to Cart [_id: ${userInstance.cartId}]`,
                    });
                }
            }
        } else {
            logger.notice({
                message: `Cart [_id: ${userInstance.cartId}] has not been found or Product [_id: ${userProductNotValidated._id}] does not exist`,
                router: 'CART',
                route: '/:cartId/products',
                method: 'POST',
            });
            res.status(404).json({
                success: false,
                message: `Cart [_id: ${userInstance.cartId}] has not been found or Product [_id: ${userProductNotValidated._id}] does not exist`,
            });
        }
    } catch (err) {
        logger.error({
            message: `Product addition to cart failed`,
            router: 'CART',
            method: 'POST',
            route: '/:cartId/products',
            stack: err,
        });
        res.status(500).send(`[POST] Add or Modify product to the Cart by Id:\n\n${err}`);
    }
});
// Delete a Product from Cart
CART.delete(
    '/products/:productId',
    passport.authenticate('jwt', {session: false}),
    async (req: Request, res: Response) => {
        try {
            const userInstance: any | undefined = req.user;
            if (userInstance === undefined) {
                throw new Error('Internal Server Error: Unauthorized user access');
            }
            const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
            // TODO FINISH THIS
            if (
                (await CartsController.exists(userInstance.cartId)) &&
                (await ProductsController.existsById(productId))
            ) {
                if (req.body.color === undefined || req.body.memory === undefined) {
                    res.status(500).json({
                        success: false,
                        message: `[DELETE] Not enough data to delete product from cart`,
                    });
                } else {
                    if (
                        !(await CartsController.isProductInCartById(
                            userInstance.cartId,
                            productId,
                            req.body.color,
                            req.body.memory
                        ))
                    ) {
                        logger.notice({
                            message: `Product [id: ${productId}] does not exists in Cart [_id: ${userInstance.cartId}]`,
                            router: 'CART',
                            method: 'DELETE',
                            route: '/:cartId/products/:productId',
                        });
                        res.status(404).json({
                            success: false,
                            message: `Product [id: ${productId}] does not exists in Cart [_id: ${userInstance.cartId}]`,
                        });
                    } else {
                        const validatedProduct: CartProductClass = await ProductsController.getValidProduct(
                            productId,
                            req.body.amount,
                            req.body.color,
                            req.body.memory
                        );
                        const flagVar: boolean = await CartsController.removeProductFromCartById(
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
                            res.status(200).json({
                                success: true,
                                message: `Product [_id: ${validatedProduct._id}] has been removed from Cart [_id: ${userInstance.cartId}]`,
                            });
                        } else {
                            logger.notice({
                                message: `Product [_id: ${validatedProduct._id}] was not removed from Cart [_id: ${userInstance.cartId}]`,
                                router: 'CART',
                                route: '/:cartId/products',
                                method: 'DELETE',
                            });
                            res.status(500).json({
                                success: false,
                                message: `Product [_id: ${validatedProduct._id}] was not removed from Cart [_id: ${userInstance.cartId}]`,
                            });
                        }
                    }
                }
            } else {
                logger.notice({
                    message: `Cart [_id: ${userInstance.cartId}] or Product [_id: ${productId}] has not been found`,
                    router: 'CART',
                    route: '/:cartId/products/:productId',
                    method: 'DELETE',
                });
                res.status(404).json({
                    success: false,
                    message: `Cart [_id: ${userInstance.cartId}] or Product [_id: ${productId}] has not been found`,
                });
            }
        } catch (err) {
            logger.error({
                message: `Product removal from cart failed`,
                router: 'CART',
                method: 'DELETE',
                route: '/:cartId/products/:productId',
                stack: err,
            });
            res.status(500).send(`[DELETE] Delete product in Cart by Id:\n\n${err}`);
        }
    }
);
// Delete all products
CART.delete('/products', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    try {
        const userInstance: any | undefined = req.user;
        if (userInstance === undefined) {
            throw new Error('Internal Server Error: Unauthorized user access');
        }
        if (await CartsController.exists(userInstance.cartId)) {
            await CartsController.emptyCartById(userInstance.cartId);
            if ((await CartsController.getAllProductsFromCartById(userInstance.cartId)).length === 0) {
                logger.notice({
                    message: `All products has been removed from Cart [_id: ${userInstance.cartId}]`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId/products',
                });
                res.status(200).json({
                    success: true,
                    message: `All products has been removed from Cart [_id: ${userInstance.cartId}]`,
                });
            } else {
                logger.notice({
                    message: `Products could not be removed from Cart [_id: ${userInstance.cartId}]`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId/products',
                });
                res.status(500).json({
                    success: false,
                    message: `Products could not be removed from Cart [_id: ${userInstance.cartId}]`,
                });
            }
        } else {
            logger.notice({
                message: `Cart [_id: ${userInstance.cartId}] has not been found`,
                router: 'CART',
                method: 'DELETE',
                route: '/:cartId/products',
            });
            res.status(404).json({success: false, message: `Cart [_id: ${userInstance.cartId}] has not been found`});
        }
    } catch (err) {
        logger.error({
            message: `Product removal from cart failed`,
            router: 'CART',
            method: 'DELETE',
            route: '/:cartId/products',
            stack: err,
        });
        res.status(500).send(`[DELETE] Delete all products in Cart:\n\n${err}`);
    }
});
// Checkout a Cart
CART.post('/checkout', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    try {
        const userInstance: any | undefined = req.user;
        if (userInstance === undefined) {
            throw new Error('Internal Server Error: Unauthorized user access');
        }
        if (
            (await CartsController.exists(userInstance.cartId)) &&
            (await CartsController.getAllProductsFromCartById(userInstance.cartId)).length > 0 &&
            (await UsersController.isEmailVerified(userInstance._id))
        ) {
            if (!(await CartsController.validateStock(userInstance.cartId))) {
                logger.notice({
                    message: `Cart [_id: ${userInstance.cartId}] does not have enough stock`,
                    router: 'CART',
                    method: 'POST',
                    route: '/checkout',
                });
                res.status(400).json({
                    success: false,
                    message: `Cart [_id: ${userInstance.cartId}] does not have enough stock`,
                });
            } else {
                const receiptInstance: ReceiptClass = await ReceiptsController.createReceipt(
                    userInstance.cartId,
                    userInstance._id
                );
                logger.http({
                    message: `Cart [_id: ${userInstance.cartId}] has been checked out`,
                    router: 'CART',
                    method: 'POST',
                    route: '/:cartId/checkout/:userId',
                });
                res.status(200).json({
                    success: true,
                    message: `Cart [_id: ${userInstance.cartId}] has been checked out`,
                    receipt: receiptInstance,
                });
            }
        } else {
            logger.http({
                message: `Cart [_id: ${userInstance.cartId}] does not exist, is empty or User [_id: ${userInstance.cartId}] email is not verified`,
                router: 'CART',
                method: 'POST',
                route: '/:cartId/checkout/:userId',
            });
            res.status(404).json({
                success: false,
                message: `Cart [_id: ${userInstance.cartId}] does not exist, is empty or User [_id: ${userInstance.cartId}] email is not verified`,
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
