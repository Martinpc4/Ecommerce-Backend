// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Controllers
import ProductsController from '../controllers/product.controller';
// * Loggers
import logger from '../logs/index.logs';
// * Middlewares
import isAdmin from '../middlewares/isAdmin.middleware';
// * Models
import ProductModel from '../models/products.model';
// * Services
import mongoose from '../services/mongodb.services';

// ! Route Definition

// * API Router
const PRODUCTS: Router = Router();

// * API Routes
PRODUCTS.get('/', async (req: Request, res: Response) => {
	try {
		logger.http({
			message: 'Product list requested and sent',
			router: 'API',
			method: 'GET',
			route: '/products/',
		});
		res.status(200).json(await ProductsController.getAll());
	} catch (err) {
		logger.error({
			message: 'Get all products failed',
			router: 'API',
			method: 'GET',
			route: '/products',
			stack: err,
		});
		res.status(500).send(err);
	}
});
PRODUCTS.get('/category/:categoryId', async (req: Request, res: Response) => {
	try {
		if (req.params.categoryId !== undefined) {
			const categoryId = Number(req.params.categoryId);
			logger.http({
				message: 'Product list requested and sent',
				router: 'API',
				method: 'GET',
				route: '/products/category/:categoryId',
			});
			res.status(200).json(await ProductsController.getCategoryById(categoryId));
		} else {
			logger.http({
				message: 'Category requested but not sent because of invalid id',
				router: 'API',
				method: 'GET',
				route: '/products/category/:categoryId',
			});
			res.status(404).send('Invalid id');
		}
	} catch (err) {
		logger.error({
			message: 'Get all products failed',
			router: 'API',
			method: 'GET',
			route: '/products',
			stack: err,
		});
		res.status(500).send(err);
	}
});
PRODUCTS.get('/:productId', async (req: Request, res: Response) => {
	try {
		const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
		if (!(await ProductsController.existsById(productId))) {
			logger.notice({
				router: 'API',
				method: 'GET',
				route: '/products/:id',
				message: 'Product not found',
			});
			res.status(404).json({ success: false, message: 'Product not found' });
		} else {
			logger.http({
				message: 'Product requested and sent',
				router: 'API',
				method: 'GET',
			});
			res.status(200).json(await ProductsController.getById(productId));
		}
	} catch (err) {
		logger.error({
			router: 'API',
			method: 'GET',
			route: '/products/:id',
			stack: err,
			message: 'Get product by ID failed',
		});
		res.status(500).send(`[GET] Get products by Id:\n\n${err}`);
	}
});
PRODUCTS.post('/', isAdmin, async (req: Request, res: Response) => {
	try {
		if (
			req.body.name !== undefined &&
			req.body.description !== undefined &&
			req.body.price !== undefined &&
			req.body.imagesURL !== undefined &&
			req.body.stock !== undefined &&
			req.body.categoryId !== undefined &&
			req.body.colors !== undefined &&
			req.body.memory !== undefined
		) {
			if (req.body.colors.length !== req.body.stock.length) {
				logger.error({
					router: 'API',
					method: 'POST',
					route: '/products',
					message: 'Error adding product, no correlation between stock and colors',
				});
				res.status(500).json({
					success: false,
					message: '[POST] Error adding product, no correlation between stock and colors',
				});
			} else {
				const productId: mongoose.Types.ObjectId = await ProductsController.save(req.body);
				if ((await ProductsController.existsById(productId))) {
					logger.http({
						message: 'Product created',
						router: 'API',
						method: 'POST',
						route: '/products',
					});
					res.status(200).json({
						success: true,
						productProperties: await ProductsController.getById(productId),
					});
				} else {
					logger.error({
						router: 'API',
						method: 'POST',
						route: '/products',
						message: 'Error adding product, missing product information',
					});
					res.status(505).json({
						success: false,
						message: '[POST] Error adding product, missing product information',
					});
				}
			}
		} else {
			logger.notice({
				message: 'Product creation failed',
				router: 'API',
				method: 'POST',
				route: '/products',
			});
			res.redirect('/api/products');
		}
	} catch (err) {
		logger.error({
			message: 'Add products failed',
			router: 'API',
			method: 'POST',
			route: '/products',
			stack: err,
		});
		res.status(500).send(`[POST] Add products:\n\n${err}`);
	}
});
PRODUCTS.put('/:productId', isAdmin, async (req: Request, res: Response) => {
	try {
		const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
		if (!(await ProductsController.existsById(productId))) {
			logger.notice({
				router: 'API',
				method: 'PUT',
				route: '/products/:id',
				message: 'Product not found',
			});
			res.status(404).json({ success: false, message: 'Product not found' });
		} else {
			await ProductsController.modifyById(productId, req.body);
			logger.http({
				message: `Product with id:${productId} modified`,
				router: 'API',
				method: 'PUT',
				route: '/products/:id',
			});
			res.status(200).json({
				success: true,
				productProperties: await ProductModel.findById(productId),
			});
		}
	} catch (err) {
		logger.error({
			router: 'API',
			method: 'PUT',
			route: '/products/:id',
			message: 'Modify products by ID failed',
			stack: err,
		});
		res.status(500).json({
			success: true,
			message: `[PUT] Modify Products by Id:\n\n${err}`,
		});
	}
});
PRODUCTS.delete('/:productId', isAdmin, async (req: Request, res: Response) => {
	try {
		const productId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(req.params.productId);
		if (!(await ProductsController.existsById(productId))) {
			logger.notice({
				router: 'API',
				method: 'DELETE',
				route: '/products/:id',
				message: 'Product not found',
			});
			res.status(404).json({ error: 'Producto no encontrado' });
		} else {
			await ProductsController.deleteById(productId);
			if (!(await ProductsController.existsById(productId))) {
				logger.http({
					message: `Product with id:${productId} deleted`,
					router: 'API',
					method: 'DELETE',
					route: '/products/:id',
				});
				res.status(200).json({ success: true });
			} else {
				logger.error({
					router: 'API',
					method: 'DELETE',
					route: '/products/:id',
					message: 'Error deleting product',
				});
				res.status(500).json({ success: false });
			}
		}
	} catch (err) {
		logger.error({
			message: 'Delete products by ID failed',
			router: 'API',
			method: 'DELETE',
			route: '/products/:id',
			stack: err,
		});
		res.status(500).send(`[DELETE] Delete Products by Id:\n\n${err}`);
	}
});

// ! Exports
export default PRODUCTS;