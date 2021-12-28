// ! Imports
// * Modules
import ejs from 'ejs';
// * Classes
import {ReceiptClass} from '../classes/receipts.class';
import {CartClass} from '../classes/carts.classes';
// * Controllers
import CartsController from './cart.controller';
import UsersController from './user.controller';
// * Data Access Objects
import ReceiptsDAO from '../daos/receipts.daos';
// * Services
import mongoose from '../services/mongodb.services';
import {adminMail, etherealTransporter, mailOptions} from '../services/nodemon.services';
// * Utils
import env from '../utils/env.utils';


// ! Controller Definition
class ReceiptController {
    constructor() {
    }

    async exists(receiptId: mongoose.Types.ObjectId): Promise<boolean> {
        return await ReceiptsDAO.existsById(receiptId) !== null;
    }

    async createReceipt(cartId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<ReceiptClass> {
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
            _id: new mongoose.Types.ObjectId(),
            userId: userId,
            cartId: cartInstance._id,
            total: cartInstance.total,
        });

        const receiptInstanced: ReceiptClass = await ReceiptsDAO.create(receiptInstance);

        await UsersController.linkCartToUserById(userId, null);
        await CartsController.deactivateCart(cartInstance._id);

        if (!(await UsersController.existsCartLinkedById(userId)) && (await this.exists(receiptInstance._id))) {
            // Send receipt to user
            await UsersController.sendMailById(userId, String(
                await ejs.renderFile(__dirname.replace('dist', 'src/views/pages/receipt.ejs'), {
                    serverAddress: env.SERVER_ADDRESS,
                    receiptId: receiptInstance._id,
                    products: cartInstance.products,
                    total: cartInstance.total,
                })
            ), 'Import BA - Receipt');

            // Notice of new purchase to admin
            await etherealTransporter.sendMail({
                ...mailOptions,
                to: adminMail,
                subject: '[Import BA] - New Purchase',
                html: String(
                    await ejs.renderFile(__dirname.replace('dist', 'src/views/pages/receipt.ejs'), {
                        serverAddress: env.SERVER_ADDRESS,
                        receiptId: receiptInstance._id,
                        products: cartInstance.products,
                        total: cartInstance.total,
                    })
                ),
            });
            return receiptInstanced;
        } else {
            throw new Error('Internal Server Error');
        }
    }
}

// ! Controller Instance
const ReceiptsController: ReceiptController = new ReceiptController();

// ! Exports
export default ReceiptsController;
