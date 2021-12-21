// ! Imports
// * Classes
import { ProductClass, CartProductClass } from '../classes/products.classes';
// * Data Access Objects
import ProductsDAO from '../daos/products.daos';
// * Types
import {
	productPropertiesInterface,
	cartProductsInterface,
	idsInArrayMethodInterface,
} from '../interfaces/products.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Controller Definition
class ProductControllerClass {
	constructor() {}
	async existsById(productId: mongoose.Types.ObjectId): Promise<boolean> {
		return await ProductsDAO.existsById(productId);
	}
	async isStockAvailable(productId: mongoose.Types.ObjectId, color: string, amount: number): Promise<boolean> {
		if (await ProductsDAO.existsById(productId)) {
			const productData: ProductClass = await ProductsDAO.getById(productId);
			if (productData.stock[productData.colors.indexOf(color)] >= amount) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	async isValidProduct(cartProductProperties: cartProductsInterface): Promise<boolean> {
		if (await ProductsDAO.existsById(cartProductProperties._id)) {
			const productData: productPropertiesInterface | null = await ProductsDAO.getById(
				cartProductProperties._id
			);
			if (productData.colors.indexOf(cartProductProperties.color) === -1) {
				return false;
			}
			if (productData.memory !== cartProductProperties.memory) {
				return false;
			}
			if (
				productData.stock[productData.colors.indexOf(cartProductProperties.color)] <=
				cartProductProperties.amount
			) {
				return false;
			}
			return true;
		} else {
			return false;
		}
	}
	async areIdsInDB(products: cartProductsInterface[]): Promise<idsInArrayMethodInterface> {
		let flagVar: boolean = true;
		let missingProductIds: mongoose.Types.ObjectId[] = [];
		let withoutStock: mongoose.Types.ObjectId[] = [];

		for await (const product of products) {
			if (!(await ProductsDAO.existsById(product._id))) {
				flagVar = false;
				missingProductIds = [...missingProductIds, product._id];
			}
			if (!(await this.isStockAvailable(product._id, product.color, product.amount))) {
				flagVar = false;
				withoutStock = [...withoutStock, product._id];
			}
		}

		return { state: flagVar, missingProductIds, withoutStock };
	}
	async save(productProperties: productPropertiesInterface): Promise<mongoose.Types.ObjectId> {
		productProperties._id = new mongoose.Types.ObjectId();
		productProperties.timeStamp = new Date();

		const savedProductInstance: ProductClass = await ProductsDAO.save(new ProductClass(productProperties));

		if (await ProductsDAO.existsById(savedProductInstance._id)) {
			return savedProductInstance._id;
		} else {
			throw new Error('The product was not saved correctly');
		}
	}
	async getById(productId: mongoose.Types.ObjectId): Promise<ProductClass | null> {
		if (await ProductsDAO.existsById(productId)) {
			return await ProductsDAO.getById(productId);
		} else {
			return null;
		}
	}
	async getCategoryById(categoryId: number): Promise<ProductClass[]> {
		const categoryProducts: ProductClass[] = await ProductsDAO.getByCategory(categoryId);
		return categoryProducts;
	}
	async getAll(): Promise<ProductClass[]> {
		const productsData: ProductClass[] = await ProductsDAO.getAll();
		return productsData;
	}
	async deleteById(productId: mongoose.Types.ObjectId): Promise<void> {
		if (!(await ProductsDAO.existsById(productId))) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			await ProductsDAO.deleteById(productId);
		}
	}
	async deleteAll(): Promise<void> {
		await ProductsDAO.deleteAll();
	}
	async modifyById(
		productId: mongoose.Types.ObjectId,
		newProductProperties: productPropertiesInterface
	): Promise<ProductClass> {
		if (!(await ProductsDAO.existsById(productId))) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			return await ProductsDAO.updateById(productId, new ProductClass(newProductProperties));
		}
	}
	async getValidProduct(
		productId: mongoose.Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<CartProductClass> {
		if (await ProductsDAO.existsById(productId)) {
			const productDocument: ProductClass = await ProductsDAO.getById(productId);

			const validatedProduct: CartProductClass = new CartProductClass({
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
			});

			return validatedProduct;
		} else {
			throw new Error(`Product [_id:${productId}] was not found`);
		}
	}
}

// ! Controller Instance
const ProductsController: ProductControllerClass = new ProductControllerClass();

// ! Exports
export default ProductsController;
