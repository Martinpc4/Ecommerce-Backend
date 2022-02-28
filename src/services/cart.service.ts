// ! Imports
// * DTOs
import { CartClass } from '../models/DTOs/cart.dto';
import { CartProductClass } from '../models/DTOs/product.dto';
// * Factories
import CartDAO from '../models/factories/cart.factory';
// * Interfaces
import { cartProductsInterface } from '../models/interfaces/product.interface';
import { Types } from 'mongoose';
// * Services
import ProductService from './product.service';
import UserService from './user.service';

// ! Services Definition
class CartServiceClass {
	async exists(cartId: Types.ObjectId): Promise<boolean> {
		return (await CartDAO.getById(cartId)) !== null;
	}

	async updateCartTotal(cartId: Types.ObjectId): Promise<number> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with [_id: ${cartId}] was not found`);
		}
		const cartInstance: CartClass = await this.getCartById(cartId);

		cartInstance.total = 0;
		cartInstance.products.forEach((cartProduct: cartProductsInterface) => {
			cartInstance.total += cartProduct.price * cartProduct.amount;
		});

		const updatedCart: CartClass = await CartDAO.updateById(cartId, cartInstance);

		return updatedCart.total;
	}

	async getCartById(cartId: Types.ObjectId): Promise<CartClass> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		} else {
			const cartInstance: CartClass | null = await CartDAO.getById(cartId);
			if (cartInstance === null) {
				throw new Error(`Internal server error: cart not found`);
			}
			return cartInstance;
		}
	}

	async isProductInCartById(
		cartId: Types.ObjectId,
		productId: Types.ObjectId,
		productColor: string,
		productMemory: number
	): Promise<boolean> {
		if (!(await this.exists(cartId))) {
			throw new Error(`Cart with id: ${cartId} was not found`);
		} else {
			const cartInstance: CartClass | null = await CartDAO.getById(cartId);

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

	async createCart(userId: Types.ObjectId, userProducts: cartProductsInterface[]): Promise<CartClass> {
		const newCartInstance: CartClass = new CartClass({
			_id: new Types.ObjectId(),
			userId: userId,
			products: userProducts,
			timeStamp: new Date(),
			total: 0,
			state: true,
		});

		const cartInstance: CartClass = await CartDAO.add(newCartInstance);

		await this.updateCartTotal(cartInstance._id);

		await UserService.linkCartToUserById(userId, cartInstance._id);

		return newCartInstance;
	}

	async removeCartById(cartId: Types.ObjectId): Promise<void> {
		if (await this.exists(cartId)) {
			await CartDAO.deleteById(cartId);
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}

	async emptyCartById(cartId: Types.ObjectId): Promise<void> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			cartInstance.products = [];
			await CartDAO.updateById(cartId, cartInstance);
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}

	async getAllProductsFromCartById(cartId: Types.ObjectId): Promise<cartProductsInterface[]> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			return cartInstance.products;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}

	async getProductByIdFromCart(
		cartId: Types.ObjectId,
		productId: Types.ObjectId,
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
		cartId: Types.ObjectId,
		productId: Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			const validatedProductInstance: CartProductClass = await ProductService.getValidProduct(
				productId,
				amount,
				color,
				memory
			);

			cartInstance.addProduct(validatedProductInstance);

			await CartDAO.updateById(cartId, cartInstance);

			return await this.isProductInCartById(cartId, productId, color, memory);
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}

	async removeProductFromCartById(
		cartId: Types.ObjectId,
		productId: Types.ObjectId,
		productColor: string,
		productMemory: number
	): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			if (!(await this.isProductInCartById(cartId, productId, productColor, productMemory))) {
				throw new Error(`Product with id:${productId} was not found in cart with id:${cartId}`);
			}

			cartInstance.removeProduct(productId, productColor, productMemory);

			await CartDAO.updateById(cartId, cartInstance);

			return !(await this.isProductInCartById(cartId, productId, productColor, productMemory));
		} else {
			throw new Error(`Cart with id:${cartId} was not found`);
		}
	}

	async modifyProductInCartById(
		cartId: Types.ObjectId,
		productId: Types.ObjectId,
		color: string,
		memory: number,
		amount: number
	): Promise<boolean> {
		if ((await this.exists(cartId)) && (await this.isProductInCartById(cartId, productId, color, memory))) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			if (!(await this.isProductInCartById(cartId, productId, color, memory))) {
				throw new Error(`Product with id:${productId} was not found in cart with id:${cartId}`);
			}

			cartInstance.modifyProductStockById(productId, memory, color, amount);

			await CartDAO.updateById(cartId, cartInstance);
			const productInstance: CartProductClass | null = await this.getProductByIdFromCart(
				cartId,
				productId,
				color
			);

			if (productInstance !== null) {
				return productInstance.amount === amount;
			} else {
				throw new Error(`Product with id:${productId} was removed from cart while modifying it`);
			}
		} else {
			throw new Error(
				`Cart with [_id: ${cartId}] was not found or Product [_id: ${productId}] was not found in cart`
			);
		}
	}

	async deactivateCart(cartId: Types.ObjectId): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);
			cartInstance.state = false;
			await CartDAO.updateById(cartId, cartInstance);
			return true;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}

	async validateStock(cartId: Types.ObjectId): Promise<boolean> {
		if (await this.exists(cartId)) {
			const cartInstance: CartClass = await this.getCartById(cartId);

			let flagVar: boolean = true;
			for (const product of cartInstance.products) {
				if (!(await ProductService.isValidProduct(product))) {
					flagVar = false;
				}
			}
			return flagVar;
		} else {
			throw new Error(`Cart with [_id:${cartId}] was not found`);
		}
	}
}

// ! Service Instance
const CartService: CartServiceClass = new CartServiceClass();

// ! Exports
export default CartService;
