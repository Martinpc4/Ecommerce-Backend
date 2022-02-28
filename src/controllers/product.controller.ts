// ! Imports
// * Interfaces
import { Request, Response } from 'express';
import { Types } from 'mongoose';
// * Logs
import logger from '../server/logs/index.logs';
// * Services
import ProductService from '../services/product.service';

// ! Controller Definition
class ProductControllerClass {
	constructor() {}
	async getAllProducts(req: Request, res: Response): Promise<void> {
		try {
			await ProductService.getAll();
			logger.http({
				message: 'Product list requested and sent',
				router: 'API',
				method: 'GET',
				route: '/products/',
			});
			res.status(200).json(await ProductService.getAll());
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
	}
	async getByCategory(req: Request, res: Response): Promise<void> {
		try {
			if (req.params.categoryId !== undefined) {
				const categoryId = Number(req.params.categoryId);
				logger.http({
					message: 'Product list requested and sent',
					router: 'API',
					method: 'GET',
					route: '/products/category/:categoryId',
				});
				res.status(200).json(await ProductService.getCategoryById(categoryId));
			} else {
				logger.http({
					message: 'Category requested but not sent because of invalid id',
					router: 'API',
					method: 'GET',
					route: '/products/category/:categoryId',
				});
				res.status(404).send('Invalid category id');
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
	}
	async getProduct(req: Request, res: Response): Promise<void> {
		try {
			const productId: Types.ObjectId = new Types.ObjectId(req.params.productId);
			if (!(await ProductService.existsById(productId))) {
				logger.notice({
					router: 'API',
					method: 'GET',
					route: '/products/:id',
					message: 'The desired product to be modified, does not exists',
				});
				res.status(404).send('The desired product to be modified, does not exists');
			} else {
				logger.http({
					message: 'Product requested and sent',
					router: 'API',
					method: 'GET',
				});
				res.status(200).json(await ProductService.getById(productId));
			}
		} catch (err) {
			logger.error({
				router: 'API',
				method: 'GET',
				route: '/products/:id',
				stack: err,
				message: 'Get product by ID failed',
			});
			res.status(500).send(err);
		}
	}
	async addProduct(req: Request, res: Response): Promise<void> {
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
					res.status(400).send('Error adding product, no correlation between stock and colors');
				} else {
					const productId: Types.ObjectId = await ProductService.save(req.body);
					if (await ProductService.existsById(productId)) {
						logger.http({
							message: 'Product created',
							router: 'API',
							method: 'POST',
							route: '/products',
						});
						res.status(200).json({
							productProperties: await ProductService.getById(productId),
						});
					} else {
						logger.error({
							router: 'API',
							method: 'POST',
							route: '/products',
							message: 'Error adding product',
						});
						res.status(500).send('Error adding product');
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
			res.status(500).send(err);
		}
	}
	async modifyProduct(req: Request, res: Response): Promise<void> {
		try {
			const productId: Types.ObjectId = new Types.ObjectId(req.params.productId);
			if (!(await ProductService.existsById(productId))) {
				logger.notice({
					router: 'API',
					method: 'PUT',
					route: '/products/:id',
					message: 'Product not found',
				});
				res.status(404).json('The desired product to be modified, does not exists');
			} else {
				await ProductService.modifyById(productId, req.body);
				logger.http({
					message: `Product with id:${productId} modified`,
					router: 'API',
					method: 'PUT',
					route: '/products/:id',
				});
				res.status(200).json({
					productProperties: await ProductService.getById(productId),
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
			res.status(500).send(err);
		}
	}
	async deleteProduct(req: Request, res: Response): Promise<void> {
		try {
			const productId: Types.ObjectId = new Types.ObjectId(req.params.productId);
			if (!(await ProductService.existsById(productId))) {
				logger.notice({
					router: 'API',
					method: 'DELETE',
					route: '/products/:id',
					message: 'Product not found',
				});
				res.status(404).send('The desired product to be deleted, does not exists');
			} else {
				await ProductService.deleteById(productId);
				if (!(await ProductService.existsById(productId))) {
					logger.http({
						message: `Product with id:${productId} deleted`,
						router: 'API',
						method: 'DELETE',
						route: '/products/:id',
					});
					res.status(200).send('Product has been deleted');
				} else {
					logger.error({
						router: 'API',
						method: 'DELETE',
						route: '/products/:id',
						message: 'Error deleting product',
					});
					res.status(500).send('Error deleting product');
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
			res.status(500).send(err);
		}
	}
}

// ! Controller Instance
const ProductsController = new ProductControllerClass();

// ! Exports
export default ProductsController;
