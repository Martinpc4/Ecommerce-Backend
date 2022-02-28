// ! Imports
// * DTOs
import { CartProductClass } from './product.dto';
// * Interfaces
import { cartPropertiesInterface } from '../interfaces/cart.interface';
import { cartProductsInterface } from '../interfaces/product.interface';
import { Types } from 'mongoose';

// ! DTO Definition
class CartClass implements cartPropertiesInterface {
	_id: Types.ObjectId;
	products: cartProductsInterface[];
	userId: Types.ObjectId;
	timeStamp: Date;
	total: number;
	state: boolean;

	constructor(cartProperties: cartPropertiesInterface) {
		this._id = cartProperties._id;
		this.products = cartProperties.products;
		this.userId = cartProperties.userId;
		this.timeStamp = cartProperties.timeStamp;
		this.total = cartProperties.total;
		this.state = cartProperties.state;
	}

	async modifyProductStockById(
		productId: Types.ObjectId,
		memory: number,
		color: string,
		amount: number
	): Promise<void> {
		this.products.forEach((productProperties) => {
			if (
				productProperties._id.equals(productId) &&
				productProperties.color === color &&
				productProperties.memory === memory
			) {
				productProperties.amount = amount;
			}
		});
	}

	addProduct(productInstance: CartProductClass) {
		this.products.push(productInstance);
	}

	removeProduct(productId: Types.ObjectId, color: string, memory: number): void {
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
	}
}

// ! Exports
export { CartClass };
