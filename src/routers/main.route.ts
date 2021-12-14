// ! Imports
// * Modules
import { Request, Response, Router } from 'express';
// * Controllers
import ProductsController from '../controllers/product.controller';
import CartsController from '../controllers/cart.controller';
// * Loggers
import logger from '../logs/index.logs';
// * Middlewares
import isAuthenticated from '../middlewares/isAuthenticated.middleware';

// ! Route Definition

// * AUTH Router
const MAIN: Router = Router();

// ! Routes
MAIN.get('/info', (req: Request, res: Response) => {
	try {
		res.status(200).json({
			arguments: process.argv,
			platform: process.platform,
			node: process.version,
			memory: process.memoryUsage(),
			path: process.execPath,
			id: process.pid,
			directory: process.cwd(),
		});
		logger.http({
			message: 'Successfully retrieve server information and status',
			method: 'GET',
			route: '/info',
			router: 'MAIN',
		});
	} catch (err) {
		res.status(500).send(`[GET] Get process info:\n\n${err}`);
		logger.error({
			message: `Getting server information and status failure`,
			method: `GET`,
			router: 'MAIN',
			route: `/info`,
			stack: err,
		});
	}
});
MAIN.get('/dashboard', async (req: Request, res: Response) => {
	if (req.user !== undefined) {
		const userData: any = req.user;

		let dashboardData: {} = {
			products: await ProductsController.getAll(),
			user: userData,
			cartProducts: userData.cartId !== null ? await CartsController.getAllProductsFromCartById(userData.cartId) : null,
			cartId: userData.cartId,
		}; 
		res.render('dashboard', dashboardData);
	}
});

// ! Export
export default MAIN;
