// ! Imports
// * Modules
import ejs from 'ejs';
// * DTOs
import { ReceiptClass } from '../models/DTOs/receipt.dto';
import { CartClass } from '../models/DTOs/cart.dto';
// * Factories
import ReceiptDAO from '../models/factories/receipt.factory';
// * Interfaces
import { Types } from 'mongoose';
// * Services
import CartsController from './cart.service';
import UsersController from './user.service';
// * Utils
import env from '../utils/env.utils';

// ! Service Definition
class ReceiptServiceClass {
	async exists(receiptId: Types.ObjectId): Promise<boolean> {
		return (await ReceiptDAO.existsById(receiptId)) !== null;
	}

	async createReceipt(cartId: Types.ObjectId, userId: Types.ObjectId): Promise<ReceiptClass> {
		if (!(await CartsController.exists(cartId))) {
			throw new Error('Cart not found');
		}
		if (!(await UsersController.existsById(userId))) {
			throw new Error('User not found');
		}

		await CartsController.updateCartTotal(cartId);

		const cartInstance: CartClass = await CartsController.getCartById(cartId);

		const receiptInstance: ReceiptClass = new ReceiptClass({
			timeStamp: new Date(),
			_id: new Types.ObjectId(),
			userId: userId,
			cartId: cartInstance._id,
			total: cartInstance.total,
		});

		const receiptInstanced: ReceiptClass = await ReceiptDAO.create(receiptInstance);

		await UsersController.linkCartToUserById(userId, null);
		await CartsController.deactivateCart(cartInstance._id);

		if (!(await UsersController.existsCartLinkedById(userId)) && (await this.exists(receiptInstance._id))) {
			// Send receipt to user
			await UsersController.sendMailById(
				userId,
				await ejs.renderFile(__dirname.replace('dist', 'src/views/pages/receipt.ejs'), {
					serverAddress: env.BACKEND_URL,
					receiptId: receiptInstance._id,
					products: cartInstance.products,
					total: cartInstance.total,
				}),
				'Purchase details'
			);
			return receiptInstanced;
		} else {
			throw new Error('Internal Server Error');
		}
	}
}

// ! Service Instance
const ReceiptService: ReceiptServiceClass = new ReceiptServiceClass();

// ! Exports
export default ReceiptService;
