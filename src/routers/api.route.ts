// ! Imports
import express, { Request, Response } from 'express';

import logger from '../logs/index.logs';

import { productsList } from '../controllers/product.controller';

import isAdmin from '../middlewares/isAdmin.middleware';
import ProductModel from '../models/products.model';

import mongoose from '../mongodb';

// ! Route Definition

// * API Router
const API = express.Router();

// * API Routes
API.get('/products/', async (req: Request, res: Response) => {
    try {
        res.status(200).json(await productsList.getAll());
        logger.http({
            message: 'Product list requested and sent',
            router: 'API',
            method: 'GET',
            route: '/products/',
        })
    } catch (err) {
        res.status(500).send(err);
        logger.error({
            message: 'Get all products failed',
            router: 'API',
            method: 'GET',
            route: '/products',
            stack: err,
        });
    }
});
API.get('/products/:id', async (req: Request, res: Response) => {
    try {
        if ((await productsList.isInArray(req.params.id)) === false) {
            logger.notice({
                router: 'API',
                method: 'GET',
                route: '/products/:id',
                message: 'Product not found',
            });
            res.status(404).json({ success: false, message: 'Product not found' });
        } else {
            res.status(200).json({
                success: true,
                productProperties: await productsList.getById(req.params.id),
            });
            logger.http({
                message: 'Product requested and sent',
                router: 'API',
                method: 'GET',
            });
        }
    } catch (err) {
        res.status(500).send(`[GET] Get products by Id:\n\n${err}`);
        logger.error({
            router: 'API',
            method: 'GET',
            route: '/products/:id',
            stack: err,
            message: 'Get product by ID failed',
        });
    }
});
API.post('/products', isAdmin, async (req: Request, res: Response) => {
    try {
        if (req.body != undefined) {
            const productId: mongoose.Types.ObjectId = await productsList.save(req.body);
            if ((await productsList.isInArray(String(productId))) === true) {
                res.status(200).json({
                    success: true,
                    productProperties: await productsList.getById(String(productId)),
                });
                logger.http({
                    message: 'Product created',
                    router: 'API',
                    method: 'POST',
                    route: '/products',
                });
            } else {
                res.status(505).send('[POST] Error adding product');
                logger.error({
                    router: 'API',
                    method: 'POST',
                    route: '/products',
                    message: 'Error adding product',
                });
            }
        } else {
            res.redirect('/api');
            logger.notice({
                message: 'Product creation failed',
                router: 'API',
                method: 'POST',
                route: '/products',
            });
        }
    } catch (err) {
        res.status(500).send(`[POST] Add products:\n\n${err}`);
        logger.error({
            message: 'Add products failed',
            router: 'API',
            method: 'POST',
            route: '/products',
            stack: err,
        });
    }
});
API.put('/products/:id', isAdmin, async (req: Request, res: Response) => {
    try {
        if ((await productsList.isInArray(req.params.id)) === false) {
            res.status(404).json({ success: false, message: 'Product not found' });
            logger.notice({
                router: 'API',
                method: 'PUT',
                route: '/products/:id',
                message: 'Product not found',
            });
        } else {
            await productsList.modifyById(req.params.id, req.body);
            res.status(200).json(
                await ProductModel.findById(new mongoose.Types.ObjectId(req.params.id))
            );
            logger.http({
                message: `Product with id:${req.params.id} modified`,
                router: 'API',
                method: 'PUT',
                route: '/products/:id',
            });
        }
    } catch (err) {
        res.status(500).send(`[PUT] Modify Products by Id:\n\n${err}`);
        logger.error({
            router: 'API',
            method: 'PUT',
            route: '/products/:id',
            message: 'Modify products by ID failed',
            stack: err,
        });
    }
});
API.delete('/products/:id', isAdmin, async (req: Request, res: Response) => {
    try {
        if ((await productsList.isInArray(req.params.id)) === false) {
            res.status(404).json({ error: 'Producto no encontrado' });
            logger.notice({
                router: 'API',
                method: 'DELETE',
                route: '/products/:id',
                message: 'Product not found',
            });
        } else {
            await productsList.deleteById(req.params.id);
            if ((await productsList.isInArray(req.params.id)) === false) {
                res.status(200).json({ success: true });
                logger.http({
                    message: `Product with id:${req.params.id} deleted`,
                    router: 'API',
                    method: 'DELETE',
                    route: '/products/:id',
                });
            } else {
                res.status(500).json({ success: false });
                logger.error({
                    router: 'API',
                    method: 'DELETE',
                    route: '/products/:id',
                    message: 'Error deleting product',
                });
            }
        }
    } catch (err) {
        res.status(500).send(`[DELETE] Delete Products by Id:\n\n${err}`);
        logger.error({
            message: 'Delete products by ID failed',
            router: 'API',
            method: 'DELETE',
            route: '/products/:id',
            stack: err,
        });
    }
});

// ! Exports
export default API;
