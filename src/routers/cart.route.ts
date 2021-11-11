// ! Imports
// * Modules
import express from 'express';

// * Classes
import { cartsList } from '../controllers/cart.controller';
import { productsList } from '../controllers/product.controller';
import { idsInArrayMethod, UserProducts } from '../interfaces/controller.interfaces';

// * Interfaces
import { productProperties } from '../interfaces/controller.interfaces';
import mongoose from '../mongodb';

import logger from '../logs/index.logs';

// ! Route Definition

// * CART Router
const CART = express.Router();

// * CART Routes
// Create new cart
CART.post('/', async (req, res) => {
    try {
        const userId: string = req.body.userId;
        const userProductsId: UserProducts[] =
            req.body.userProductsId !== undefined
                ? req.body.userProductsId.length > 0
                    ? req.body.userProductsId
                    : []
                : [];
        if (userId !== undefined) {
            // TODO Implemendar chequeo de existencia de usuario y de su carrito
            const productsCheck: idsInArrayMethod = await productsList.areIdsInArray(
                userProductsId
            );
            if (productsCheck.state === true) {
                res.status(200).json({
                    success: true,
                    cartId: await cartsList.createCart(userId, userProductsId),
                });
                logger.http({
                    message: `Cart created for user ${userId}`,
                    router: 'CART',
                    route: '/',
                    method: 'POST',
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: {
                        missingProductIds: productsCheck.missingProductIds,
                        productsWithoutStock: productsCheck.withoutStock,
                    },
                });
                logger.notice({
                    message: `User ${userId} tried to create a cart with products ${userProductsId}`,
                    router: 'CART',
                    method: 'POST',
                    route: '/',
                });
            }
        } else {
            res.status(500).json({
                success: false,
                message: 'User does not exists or already has a cart',
            });
            logger.notice({
                message: 'User does not exists or already has a cart',
                router: 'CART',
                method: 'POST',
                route: '/',
            });
        }
    } catch (err) {
        logger.error({
            message: 'Cart creation failed',
            router: 'CART',
            method: 'GET',
            route: '/',
            stack: err,
        });
        res.status(500).send(`[POST] Create new cart:\n\n${err}`);
    }
});
// Delete a cart
CART.delete('/:cartId', async (req, res) => {
    try {
        const cartId: string = req.params.cartId;
        if ((await cartsList.isCartInList(cartId)) === true) {
            await cartsList.removeCartById(cartId);
            if ((await cartsList.isCartInList(cartId)) === false) {
                res.status(200).json({ success: true });
                logger.http({
                    message: `Cart (id: ${cartId}) has been deleted`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId',
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '[DELETE] Internal server error, cart not deleted',
                });
                logger.notice({
                    message: `Cart (id: ${cartId}) could not be deleted`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId',
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: `cart with id: ${cartId} has not been found`,
            });
            logger.notice({
                message: `Cart with id: ${cartId} has not been found`,
                router: 'CART',
                route: '/:cartId',
                method: 'DELETE',
            });
        }
    } catch (err) {
        res.status(500).send(`[DELETE] Delete cart by Id:\n\n${err}`);
        logger.error({
            message: 'Cart deletion failed',
            router: 'CART',
            method: 'DELETE',
            route: '/:cartId',
            stack: err,
        });
    }
});
// Get all products from a cart
CART.get('/:cartId/products', async (req, res) => {
    try {
        if (mongoose.isValidObjectId(req.params.cartId) && req.params.cartId !== undefined) {
            const cartId: string = req.params.cartId;
            if (await cartsList.isCartInList(cartId)) {
                const productsArray: productProperties[] =
                    await cartsList.getAllProductsFromCartById(cartId);
                res.status(200).json({ products: productsArray });
                logger.http({
                    message: `Products from cart (id: ${cartId}) have been retrieved`,
                    router: 'CART',
                    method: 'GET',
                    route: '/:cartId/products',
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: `cart with id: ${cartId} has not been found`,
                });
                logger.notice({
                    message: `Cart with id: ${cartId} has not been found`,
                    router: 'CART',
                    route: '/:cartId/products',
                    method: 'GET',
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: 'Object id is not valid or missing data',
            });
            logger.notice({
                message: 'Object id is not valid or missing data',
                router: 'CART',
                route: '/:cartId/products',
                method: 'GET',
            });
        }
    } catch (err) {
        res.status(500).send(`[GET] Get cart by Id:\n\n${err}`);
        logger.error({
            message: 'Cart retrieval failed',
            router: 'CART',
            method: 'GET',
            route: '/:cartId/products',
            stack: err,
        });
    }
});
// Add or Modify products to Cart
CART.post('/:cartId/products', async (req, res) => {
    try {
        const cartId: string = req.params.cartId;
        if (await cartsList.isCartInList(cartId)) {
            const userProducts: UserProducts[] = req.body.products;

            // Validating products & sending propper response if needed

            const verifyProducts: idsInArrayMethod = await productsList.areIdsInArray(userProducts);

            if (verifyProducts.state === false) {
                res.status(404).json({
                    success: false,
                    message: {
                        missingProductIds: verifyProducts.missingProductIds,
                        productsWithoutStock: verifyProducts.withoutStock,
                    },
                });
                logger.notice({
                    message: `User tried to add products (${userProducts}) to cart ${cartId}`,
                    router: 'CART',
                    method: 'POST',
                    route: '/:cartId/products',
                });
            }
            // Adding products to cart
            userProducts.forEach(async (productProperties) => {
                await cartsList.addProductToCartById(
                    cartId,
                    productProperties.productId,
                    productProperties.amount
                );
            });
            // Verifying that all products have been correctly added & sending the propper response
            for await (const productProperties of userProducts) {
                if (
                    !(await cartsList.isProductInCartById(
                        cartId,
                        String(productProperties.productId)
                    ))
                ) {
                    await cartsList.emptyCartById(cartId);
                    res.status(500).json({
                        success: false,
                        message: 'Internal server error, cart emptied',
                    });
                    logger.notice({
                        message: `User tried to add products (${userProducts}) to cart ${cartId}`,
                        router: 'CART',
                        method: 'POST',
                        route: '/:cartId/products',
                    });
                }
            }
            res.status(200).json({ success: true });
            logger.http({
                message: `Products (${userProducts}) have been added to cart ${cartId}`,
                router: 'CART',
                method: 'POST',
                route: '/:cartId/products',
            });
        } else {
            res.status(404).json({
                success: false,
                message: `cart with id: ${cartId} has not been found`,
            });
            logger.notice({
                message: `Cart with id: ${cartId} has not been found`,
                router: 'CART',
                route: '/:cartId/products',
                method: 'POST',
            });
        }
    } catch (err) {
        res.status(500).send(`[POST] Add or Modify product to the Cart by Id:\n\n${err}`);
        logger.error({
            message: `Product addition to cart (id: ${req.params.cartId}) failed`,
            router: 'CART',
            method: 'POST',
            route: '/:cartId/products',
            stack: err,
        });
    }
});
CART.delete('/:cartId/products/:productId', async (req, res) => {
    try {
        const cartId: string = req.params.cartId;
        const productId: string = req.params.productId;
        // Cart validation
        if ((await cartsList.isCartInList(cartId)) === true) {
            // Product validation
            if ((await cartsList.isProductInCartById(cartId, productId)) === true) {
                await cartsList.removeProductFromCartById(cartId, productId);
                console.log(await cartsList.isProductInCartById(cartId, productId));
                if ((await cartsList.isProductInCartById(cartId, productId)) === true) {
                    await cartsList.emptyCartById(cartId);
                    res.status(500).json({
                        success: false,
                        message: 'Internal server error, cart emptied',
                    });
                    logger.notice({
                        message: `User tried to remove product (id: ${productId}) from cart ${cartId}`,
                        router: 'CART',
                        method: 'DELETE',
                        route: '/:cartId/products/:productId',
                    });
                } else {
                    res.status(200).json({ success: true });
                    logger.http({
                        message: `Product (id: ${productId}) has been removed from cart ${cartId}`,
                        router: 'CART',
                        method: 'DELETE',
                        route: '/:cartId/products/:productId',
                    })
                }
            } else {
                res.status(404).json({
                    success: false,
                    message: `product with id: ${productId} does not exists in cart with id: ${cartId}`,
                });
                logger.notice({
                    message: `Product (id: ${productId}) does not exists in cart (id: ${cartId})`,
                    router: 'CART',
                    method: 'DELETE',
                    route: '/:cartId/products/:productId',
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: `cart with id: ${cartId} has not been found`,
            });
            logger.notice({
                message: `Cart with id: ${cartId} has not been found`,
                router: 'CART',
                route: '/:cartId/products/:productId',
                method: 'DELETE',
            });
        }
    } catch (err) {
        res.status(500).send(`[DELTE] Delete product in Cart by Id:\n\n${err}`);
        logger.error({
            message: `Product removal from cart (id: ${req.params.cartId}) failed`,
            router: 'CART',
            method: 'DELETE',
            route: '/:cartId/products/:productId',
            stack: err,
        });
    }
});

// ! Exports
export default CART;
