// ! Imports
// * DTOs
import { CartClass } from '../DTOs/cart.dto';
// * Interfaces
import { cartPropertiesInterface } from '../interfaces/cart.interface';
import { Types } from 'mongoose';
// * Models
import CartModel from '../cart.model';

// ! DAO Definition
class CartDAO {
	async existsById(cartId: Types.ObjectId): Promise<boolean> {
		const cartDocument: cartPropertiesInterface | null = await CartModel.findById(cartId);
		return cartDocument !== null;
	}
	async getById(cartId: Types.ObjectId): Promise<CartClass | null> {
		const cartDocument: any | null = await CartModel.findById(cartId);
		if (cartDocument !== null) {
			return new CartClass(cartDocument);
		}
		return null;
	}
	async updateById(cartId: Types.ObjectId, cartInstance: CartClass): Promise<CartClass> {
		const cartDocument: cartPropertiesInterface | null = await CartModel.findByIdAndUpdate(cartId, cartInstance);
		if (cartDocument === null) {
			throw new Error('Cart not found or could not update it');
		} else {
			return new CartClass(cartDocument);
		}
	}
	async deleteById(cartId: Types.ObjectId): Promise<boolean> {
		if (await this.existsById(cartId)) {
			await CartModel.findByIdAndDelete(cartId);
			if (await this.existsById(cartId)) {
				throw new Error('Cart deletion failed');
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
	async add(cartInstance: CartClass): Promise<CartClass> {
		const cartDocument: cartPropertiesInterface = await CartModel.create(cartInstance);
		if (await this.existsById(cartInstance._id)) {
			return new CartClass(cartDocument);
		} else {
			throw new Error('Cart creation failed');
		}
	}
}

// ! Exports
export default CartDAO;
