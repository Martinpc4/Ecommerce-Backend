// ! Imports
// * Classes
import { CartClass } from '../classes/carts.classes';
import { CartProductClass } from '../classes/products.classes';
// * Controllers
import ProductsController from './product.controller';
import UsersController from './user.controller';
// * Data Access Objects
import CartsDAO from '../daos/carts.daos';
// * Types
import { cartProductsInterface } from '../interfaces/products.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Controller Definition
class CartControllerClass {
	constructor() {}
	async exists(cartId: mongoose.Types.ObjectId): Promise<boolean> {
		if ((await CartsDAO.getById(cartId)) !== null) {
			return true;
		} else {
			return false;
		}
	}
	async updateCartTotal(cartId: mongoose.Types.ObjectId): Promise<number> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with [_id: ${cartId}] was not found`);
		}
		const cartInstace: CartClass = await this.getCartById(cartId);

		cartInstace.total = 0;
		cartInstace.products.forEach((cartProduct) => {
			cartInstace.total += cartProduct.price * cartProduct.amount;
		});

		const updatedCart: CartClass = await CartsDAO.updateById(cartId, cartInstace);

		return updatedCart.total;
	}
	async getCartById(cartId: mongoose.Types.ObjectId): Promise<CartClass> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		} else {
			const cartInstance: CartClass | null = await CartsDAO.getById(cartId);
			if (cartInstance === null) {
				throw new Error(`Internal server error: cart not found`);
			}
			return cartInstance;
		}
	}
	async isProductInCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		productColor: string,
		productMemory: number
	): Promise<boolean> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with id: ${cartId} was not found`);
		} else {
			const cartInstance: CartClass | null = await CartsDAO.getById(cartId);

			if (cartInstance === null) {
				throw new Error(`Internal server error: cart not found`);
			}

			let flagVar: boolean = false;
			cartInstance.products.forEach((productProperties) => {
				if (
					productProperties._id.equals(productId) &&
					productProperties.color === productColor &&
					productProperties.memory === productMemory
				) {
					flagVar = true;
					return;
				}
			});
			return flagVar;
		}
	}
	async createCart(userId: mongoose.Types.ObjectId, userProducts: cartProductsInterface[]): Promise<CartClass> {
		const newCartInstance: CartClass = new CartClass({
			_id: new mongoose.Types.ObjectId(),
			userId: userId,
			products: userProducts,
			timeStamp: new Date(),
			total: 0,
			state: true,
		});

		const cartInstance: CartClass = await CartsDAO.add(newCartInstance);

		await this.updateCartTotal(cartInstance._id);

		await UsersController.linkCartToUserById(userId, cartInstance._id);

		return newCartInstance;
	}
	async removeCartById(cartId: mongoose.Types.ObjectId): Promise<void> {
		if (await this.exists(cartId)) {
			await CartsDAO.deleteById(cartId);
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async emptyCartById(cartId: mongoose.Types.ObjectId): Promise<void> {
		if ((await this.exists(cartId)) === true) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			cartInstance.products = [];
			await CartsDAO.updateById(cartId, cartInstance);
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async getAllProductsFromCartById(cartId: mongoose.Types.ObjectId): Promise<cartProductsInterface[]> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			return cartInstance.products;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
	async getProductByIdFromCart(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		color: string
	): Promise<CartProductClass | null> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			let productProperties: CartProductClass | null = null;

			cartInstance.products.forEach((product) => {
				if (product._id.equals(productId) && product.color === color) {
					productProperties = product;
				}
			});
			return productProperties;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
	async addProductToCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			const validatedProduct: CartProductClass = await ProductsController.getValidProduct(
				productId,
				amount,
				color,
				memory
			);

			await cartInstance.addProductById(
				validatedProduct._id,
				validatedProduct.amount,
				validatedProduct.memory,
				validatedProduct.color
			);

			await CartsDAO.updateById(cartId, cartInstance);

			if (await this.isProductInCartById(cartId, productId, color, memory)) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async removeProductFromCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		productColor: string,
		productMemory: number
	): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			cartInstance.removeProductById(productId, productColor, productMemory);

			await CartsDAO.updateById(cartId, cartInstance);

			if (!(await this.isProductInCartById(cartId, productId, productColor, productMemory))) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async modifyProductInCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		color: string,
		memory: number,
		amount: number
	): Promise<boolean> {
		if ((await this.exists(cartId)) || (await this.isProductInCartById(cartId, productId, color, memory))) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			cartInstance.modifyProductStockById(productId, memory, color, amount);

			if (await this.isProductInCartById(cartId, productId, color, memory)) {
				await CartsDAO.updateById(cartId, cartInstance);
				return true;
			} else {
				throw new Error('Internal server error');
			}
		} else {
			throw new Error(
				`Cart with [_id: ${cartId}] was not found or Product [_id: ${productId}] was not found in cart`
			);
		}
	}
	async deactivateCart(cartId: mongoose.Types.ObjectId): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			cartInstance.state = false;
			await CartsDAO.updateById(cartId, cartInstance);
			return true;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
	async validateStock(cartId: mongoose.Types.ObjectId): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			return await cartInstance.validateStock();
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
}

// ! Controller Instance
const CartsController: CartControllerClass = new CartControllerClass();

// ! Exports
export default CartsController;
