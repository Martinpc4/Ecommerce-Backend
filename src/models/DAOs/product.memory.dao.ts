// ! Imports
// * DTOs
import { ProductClass } from '../DTOs/product.dto';
// * Interfaces
import { Types } from 'mongoose';

// ! DAO Definition
class ProductDAO {
	private products: ProductClass[];
	constructor() {
		this.products = [];
	}
	existsById(productId: Types.ObjectId): boolean {
		for (const productInstance of this.products) {
			if (productInstance._id.equals(productId)) {
				return true;
			}
		}
		return false;
	}
	getById(productId: Types.ObjectId): ProductClass {
		if (this.existsById(productId)) {
			for (const productInstance of this.products) {
				if (productInstance._id.equals(productId)) {
					return productInstance;
				}
			}
			throw new Error('Internal server error');
		} else {
			throw new Error('Product not found');
		}
	}
	getAll(): ProductClass[] {
		return this.products;
	}
	deleteById(productId: Types.ObjectId): boolean {
		if (this.existsById(productId)) {
			let productsArray: ProductClass[] = [];
			let flagVar: boolean = false;
			for (const productInstance of this.products) {
				if (!productInstance._id.equals(productId)) {
					productsArray.push(productInstance);
				} else {
					flagVar = true;
				}
			}
			if (flagVar) {
				this.products = productsArray;
				return flagVar;
			} else {
				throw new Error('Internal server error');
			}
		} else {
			return false;
		}
	}
	save(productInstance: ProductClass): ProductClass {
		this.products.push(productInstance);
		if (this.existsById(productInstance._id)) {
			return this.getById(productInstance._id);
		} else {
			throw new Error(`Product with id ${productInstance._id} could not be created`);
		}
	}
	updateById(productId: Types.ObjectId, updatedProductInstance: ProductClass): ProductClass {
		if (this.existsById(productId)) {
			let modifiedProduct: ProductClass | null = null;
			let productsArray: ProductClass[] = [];
			this.products.forEach((productInstance) => {
				if (productInstance._id.equals(productId)) {
					Object.keys(updatedProductInstance).forEach((key) => {
						if (updatedProductInstance[key] === undefined) {
							delete updatedProductInstance[key];
						}
					});
					modifiedProduct = new ProductClass({ ...productInstance, ...updatedProductInstance });
					productsArray.push(modifiedProduct);
				} else {
					productsArray.push(productInstance);
				}
			});
			if (modifiedProduct !== null) {
				this.products = productsArray;
				return modifiedProduct;
			} else {
				throw new Error('Internal server error');
			}
		} else {
			throw new Error(`Product with id ${productId} not found`);
		}
	}
	getByCategory(categoryId: number): ProductClass[] {
		let productsArray: ProductClass[] = [];
		for (const productInstance of this.products) {
			if (productInstance.categoryId === categoryId) {
				productsArray.push(productInstance);
			}
		}
		return productsArray;
	}
	deleteAll(): boolean {
		this.products = [];
		return this.products.length === 0;
	}
}

// ! Exports
export default ProductDAO;
