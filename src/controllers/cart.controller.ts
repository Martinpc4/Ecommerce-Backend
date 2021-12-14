// ! Imports
// * Modules
import ProductsController from './product.controller';
import UsersController from './user.controller';
// * Classes
import { CartClass } from '../classes/carts.classes';
import { CartProductClass } from '../classes/products.classes';
// * Interfaces
import { cartPropertiesInterface } from '../interfaces/carts.interfaces';
import { cartProductsInterface } from '../interfaces/products.interfaces';
// * Models
import CartsModel from '../models/carts.model';
// * Config
import mongoose from '../config/mongodb.config';

// ! Controller
class CartControllerClass {
	constructor() {}
	async exists(cartId: mongoose.Types.ObjectId): Promise<boolean> {
		if ((await CartsModel.findById(cartId)) !== null) {
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

		await CartsModel.findOneAndUpdate({ _id: cartId }, { $set: { total: cartInstace.total } });

		return cartInstace.total;
	}
	async getCartById(cartId: mongoose.Types.ObjectId): Promise<CartClass> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
		const cartDocument: cartPropertiesInterface | null = await CartsModel.findById(cartId);
		if (cartDocument === null) {
			throw new Error('Internal server error');
		}
		const cartInstance: CartClass = new CartClass(cartDocument);
		return cartInstance;
	}
	async isProductInCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		productColor: string,
		productMemory: number
	): Promise<boolean> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with id: ${cartId} was not found`);
		}
		const cartFound: cartPropertiesInterface | null = await CartsModel.findById(cartId);
		if (cartFound !== null) {
			const cartInstanced: CartClass = new CartClass(cartFound);
			let flagVar: boolean = false;
			cartInstanced.products.forEach((productProperties) => {
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
		throw new Error('Internal server error');
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

		const cartDocument: mongoose.Document = new CartsModel(newCartInstance);

		await cartDocument.save();

		await this.updateCartTotal(newCartInstance._id);

		await UsersController.linkCartToUserById(userId, cartDocument._id);

		return newCartInstance;
	}
	async removeCartById(cartId: mongoose.Types.ObjectId): Promise<void> {
		if (await this.exists(cartId)) {
			await CartsModel.deleteOne({
				_id: cartId,
			});
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async emptyCartById(cartId: mongoose.Types.ObjectId): Promise<void> {
		if ((await this.exists(cartId)) === true) {
			await CartsModel.updateOne({ _id: cartId }, { $set: { products: [] } });
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}
	async getAllProductsFromCartById(cartId: mongoose.Types.ObjectId): Promise<cartProductsInterface[]> {
		const cartDocument: cartPropertiesInterface | null = await CartsModel.findById(cartId);
		if (cartDocument !== null) {
			return cartDocument.products;
		}
		throw new Error('Internal server errror');
	}
	async addProductToCartById(
		cartId: mongoose.Types.ObjectId,
		productId: mongoose.Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartData: cartPropertiesInterface | null = await CartsModel.findById(cartId);
			if (cartData !== null) {
				const cartInstance: CartClass = new CartClass(cartData);
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

				await CartsModel.updateOne({ _id: cartId }, { $set: { products: cartInstance.products } });

				if (await this.isProductInCartById(cartId, productId, color, memory)) {
					return true;
				} else {
					return false;
				}
			} else {
				throw new Error('Internal server error');
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
			const cartData: cartPropertiesInterface | null = await CartsModel.findById(cartId);
			if (cartData !== null) {
				const cartInstance: CartClass = new CartClass(cartData);
				cartInstance.removeProductById(productId, productColor, productMemory);

				await CartsModel.updateOne({ _id: cartId }, { $set: { products: cartInstance.products } });

				if (!(await this.isProductInCartById(cartId, productId, productColor, productMemory))) {
					return true;
				} else {
					return false;
				}
			} else {
				throw new Error('Internal server error');
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
			const cartData: cartPropertiesInterface | null = await CartsModel.findById(cartId);
			if (cartData === null) {
				throw new Error('Internal server error');
			}
			const cartInstance: CartClass = new CartClass(cartData);
			cartInstance.modifyProductStockById(productId, memory, color, amount);

			if (await this.isProductInCartById(cartId, productId, color, memory)) {
				await CartsModel.updateOne({ _id: { $eq: cartId } }, { $set: { products: cartInstance.products } });
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
			await CartsModel.updateOne({ _id: cartId }, { $set: { state: false } });
			return true;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
}

// ! Controller Instance
const CartsController: CartControllerClass = new CartControllerClass();

// ! Exports
export default CartsController;
