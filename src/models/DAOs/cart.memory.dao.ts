// ! Imports
// * DTOs
import { CartClass } from '../DTOs/cart.dto';
// * Interfaces
import { Types } from 'mongoose';

// ! DAO Definition
class CartDAO {
	private carts: CartClass[];
	constructor() {
		this.carts = [];
	}
	existsById(cartId: Types.ObjectId): boolean {
		let flagVar: boolean = false;
		this.carts.forEach((cartInstance) => {
			if (cartInstance._id.equals(cartId)) {
				flagVar = true;
			}
		});

		return flagVar;
	}
	getById(cartId: Types.ObjectId): CartClass | null {
		for (const cartInstance of this.carts) {
			if (cartInstance._id.equals(cartId)) {
				return cartInstance;
			}
		}
		return null;
	}
	updateById(cartId: Types.ObjectId, updatedCartInstance: CartClass): CartClass {
		for (let cartInstance of this.carts) {
			if (cartInstance._id.equals(cartId)) {
				cartInstance = updatedCartInstance;
				return cartInstance;
			}
		}
		throw new Error(`Cart with id ${cartId} not found`);
	}
	deleteById(cartId: Types.ObjectId): boolean {
		let cartsArray: CartClass[] = [];
		let flagVar: boolean = false;
		this.carts.forEach((cartInstance) => {
			if (!cartInstance._id.equals(cartId)) {
				cartsArray.push(cartInstance);
			} else {
				flagVar = true;
			}
		});
		this.carts = cartsArray;
		return flagVar;
	}
	add(cartInstance: CartClass): CartClass {
		this.carts.push(cartInstance);
		if (this.existsById(cartInstance._id)) {
			return cartInstance;
		} else {
			throw new Error('Cart creation failed');
		}
	}
}

// ! Exports
export default CartDAO;
