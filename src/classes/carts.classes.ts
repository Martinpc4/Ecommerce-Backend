// ! Imports
// * Classes
import { ProductClass } from './products.classes';
// * Data Access Objects
import ProductsDAO from '../daos/products.daos';
// * Types
import { cartPropertiesInterface } from '../interfaces/carts.interfaces';
import { cartProductsInterface } from '../interfaces/products.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Class Definition
class CartClass {
	_id: mongoose.Types.ObjectId;
	products: cartProductsInterface[];
	userId: mongoose.Types.ObjectId;
	timeStamp: Date;
	total: number;
	state: boolean;
	constructor(cartProperties: cartPropertiesInterface) {
		(this._id = cartProperties._id),
			(this.products = cartProperties.products),
			(this.userId = cartProperties.userId),
			(this.timeStamp = cartProperties.timeStamp),
			(this.total = cartProperties.total),
			(this.state = cartProperties.state);
	}
	isProductInCart(productId: mongoose.Types.ObjectId, color: string, memory: number): boolean {
		let flagVar: boolean = false;
		this.products.forEach((productProperties) => {
			if (
				productProperties._id.equals(productId) &&
				productProperties.color === color &&
				productProperties.memory === memory
			) {
				flagVar = true;
				return;
			}
		});
		return flagVar;
	}
	modifyProductStockById(productId: mongoose.Types.ObjectId, memory: number, color: string, amount: number): void {
		if (this.isProductInCart(productId, color, memory) === true) {
			this.products.forEach((productProperties) => {
				if (
					productProperties._id.equals(productId) &&
					productProperties.color === color &&
					productProperties.memory === memory
				) {
					productProperties.amount = amount;
				}
			});
		} else {
			throw new Error('Product is not in Cart');
		}
	}
	async addProductById(
		productId: mongoose.Types.ObjectId,
		amount: number,
		memory: number,
		color: string
	): Promise<void> {
		if (await ProductsDAO.existsById(productId)) {
			const productDocument: ProductClass = await ProductsDAO.getById(productId);

			if (productDocument == null) {
				throw new Error(`The product with id ${productId} does not exist in database`);
			}

			const newProduct: cartProductsInterface = {
				_id: productDocument._id,
				name: productDocument.name,
				description: productDocument.description,
				price: productDocument.price,
				imagesURL: productDocument.imagesURL,
				timeStamp: productDocument.timeStamp,
				categoryId: productDocument.categoryId,
				color: color,
				memory: memory,
				amount,
			};

			this.products.push(newProduct);
		} else {
			throw new Error(`The product with id ${productId} does not exist in database`);
		}
	}
	removeProductById(productId: mongoose.Types.ObjectId, color: string, memory: number): void {
		if (this.isProductInCart(productId, color, memory) === true) {
			let newProducts: cartProductsInterface[] = [];
			this.products.forEach((productProperties) => {
				if (
					!(
						productProperties._id.equals(productId) &&
						productProperties.color === color &&
						productProperties.memory === memory
					)
				) {
					newProducts.push(productProperties);
				}
			});
			this.products = newProducts;
		} else {
			throw new Error(`El producto con el id: ${productId}, no se encuenta en el carrito`);
		}
	}
}

// ! Exports
export { CartClass };
