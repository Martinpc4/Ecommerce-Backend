// ! Imports
// * Classes
import { ProductClass } from '../classes/products.classes';
// * Types
import { productPropertiesInterface } from '../interfaces/products.interfaces';
// * Models
import ProductsModel from '../models/products.model';
// * Services
import mongoose from '../services/mongodb.services';

// ! Data Access Object Definition
class ProductsDAO {
	constructor() {}
	async existsById(productId: mongoose.Types.ObjectId): Promise<boolean> {
		const productDocument: productPropertiesInterface | null = await ProductsModel.findById(productId);
		if (productDocument === null) {
			return false;
		}
		return true;
	}
	async getById(productId: mongoose.Types.ObjectId): Promise<ProductClass> {
		if (await this.existsById(productId)) {
			const productDocument: productPropertiesInterface | null = await ProductsModel.findById(productId);
			if (productDocument === null) {
				throw new Error('Internal Server Error');
			} else {
				return new ProductClass(productDocument);
			}
		} else {
			throw new Error('Product not found');
		}
	}
	async getAll(): Promise<ProductClass[]> {
		const productsDocuments: productPropertiesInterface[] = await ProductsModel.find({});
		let productInstances: ProductClass[] = [];
		productsDocuments.forEach((product) => {
			productInstances.push(new ProductClass(product));
		});
		return productInstances;
	}
	async deleteById(productId: mongoose.Types.ObjectId): Promise<boolean> {
		if (await this.existsById(productId)) {
			await ProductsModel.findByIdAndDelete(productId);
			if (await this.existsById(productId)) {
				throw new Error('Product deletion failed');
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
	async save(productInstance: ProductClass): Promise<ProductClass> {
		const productDocument: productPropertiesInterface = await ProductsModel.create(productInstance);
		return new ProductClass(productDocument);
	}
	async updateById(productId: mongoose.Types.ObjectId, productInstance: ProductClass): Promise<ProductClass> {
		const productDocument: productPropertiesInterface | null = await ProductsModel.findByIdAndUpdate(
			productId,
			productInstance
		);
		if (productDocument === null) {
			throw new Error('Product not found');
		} else {
			return new ProductClass(productDocument);
		}
	}
	async getByCategory(categoryId: number): Promise<ProductClass[]> {
		const productsDocuments: productPropertiesInterface[] = await ProductsModel.find({
			categoryId: { $eq: categoryId },
		});
		let productInstances: ProductClass[] = [];
		productsDocuments.forEach((product) => {
			productInstances.push(new ProductClass(product));
		});
		return productInstances;
	}
	async deleteAll(): Promise<boolean> {
		await ProductsModel.deleteMany({});
		if ((await this.getAll()).length === 0) {
			return true;
		} else {
			throw new Error('Products deletion failed');
		}
	}
}

// ! Data Access Object Instance
const ProductsDAOInstance: ProductsDAO = new ProductsDAO();

// ! Exports
export default ProductsDAOInstance;
