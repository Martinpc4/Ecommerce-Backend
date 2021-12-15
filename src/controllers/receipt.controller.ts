// ! Imports
// * Modules
import ejs from 'ejs';
// * Controllers
import CartsController from './cart.controller';
import UsersController from './user.controller';
// * Classes
import { ReceiptClass } from '../classes/receipts.class';
import { CartClass } from '../classes/carts.classes';
// * Models
import ReceiptsModel from '../models/receips.model';
// * Config
import mongoose from '../config/mongodb.config';
import { adminMail, etherealTransporter, mailOptions } from '../config/ethereal.config';
import env from '../config/env.config';

// ! Controller
class ReceiptController {
	constructor() {}
	async exists(receiptId: mongoose.Types.ObjectId): Promise<boolean> {
		if ((await ReceiptsModel.exists({ _id: receiptId })) !== null) {
			return true;
		} else {
			return false;
		}
	}
	async createReceipt(cartId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<ReceiptClass> {
		if (!(await CartsController.exists(cartId))) {
			throw new Error('Cart not found');
		}
		if (!(await UsersController.isUserById(userId))) {
			throw new Error('User not found');
		}

		await CartsController.updateCartTotal(cartId);

		const cartInstance: CartClass = await CartsController.getCartById(cartId);

		const receiptInstance: ReceiptClass = new ReceiptClass({
			timeStamp: new Date(),
			_id: new mongoose.Types.ObjectId(),
			userId: userId,
			cartId: cartInstance._id,
			total: cartInstance.total,
		});

		const receiptDocument: mongoose.Document = new ReceiptsModel(receiptInstance);
		
		receiptDocument.save();
		
		await UsersController.linkCartToUserById(userId, null);
		await CartsController.deactivateCart(cartInstance._id);

		if (!(await UsersController.existsCartLinkedById(userId)) && (await this.exists(receiptInstance._id))) {
			await etherealTransporter.sendMail({
				...mailOptions,
				to: (await UsersController.getUserById(userId)).email.email,
				subject: 'Import BA - Receipt',
				html: String(
					await ejs.renderFile(__dirname.replace('dist/controllers', 'src/views/pages/receipt.ejs'), {
						serverAddress: env.SERVER_ADDRESS,
						receiptId: receiptInstance._id,
						products: cartInstance.products,
						total: cartInstance.total,
					})
				),
			});
			await etherealTransporter.sendMail({
				...mailOptions,
				to: adminMail,
				subject: '[Import BA] - New Purchase',
				html: String(
					await ejs.renderFile(__dirname.replace('dist/controllers', 'src/views/pages/receipt.ejs'), {
						serverAddress: env.SERVER_ADDRESS,
						receiptId: receiptInstance._id,
						products: cartInstance.products,
						total: cartInstance.total,
					})
				),
			});
			return receiptInstance;
		} else {
			throw new Error('Internal Server Error');
		}
	}
}

// ! Controller Instance
const ReceiptsController: ReceiptController = new ReceiptController();

// ! Exports
export default ReceiptsController;
