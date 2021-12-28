// ! Imports
// * Classes
import { CartClass } from '../classes/carts.classes';
// * Types
import { cartPropertiesInterface } from '../interfaces/carts.interfaces';
// * Models
import CartModel from '../models/carts.model';
// * Services
import mongoose from '../services/mongodb.services';

// ! Data Access Object Definition
class CartsDAO {
	constructor() {}
	async existsById(cartId: mongoose.Types.ObjectId): Promise<boolean> {
		const cartDocument: cartPropertiesInterface | null = await CartModel.findById(cartId);
		return cartDocument !== null;

	}
	async getById(cartId: mongoose.Types.ObjectId): Promise<CartClass | null> {
		const cartDocument: any | null = await CartModel.findById(cartId);
		if (cartDocument !== null) {
			return new CartClass(cartDocument);
		}
		return null;
	}
	async updateById(cartId: mongoose.Types.ObjectId, cartInstance: CartClass): Promise<CartClass> {
		const cartDocument: cartPropertiesInterface | null = await CartModel.findByIdAndUpdate(cartId, cartInstance);
		if (cartDocument === null) {
			throw new Error('Cart not found');
		} else {
			return new CartClass(cartDocument);
		}
	}
	async deleteById(cartId: mongoose.Types.ObjectId): Promise<boolean> {
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

// ! Data Access Object Instance
const CartsDAOInstance: CartsDAO = new CartsDAO();

// ! Exports
export default CartsDAOInstance;
