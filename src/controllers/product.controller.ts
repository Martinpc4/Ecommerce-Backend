// ! Imports
// * Classes
import { ProductClass, CartProductClass } from '../classes/products.classes';
// * Interfaces
import {
	productPropertiesInterface,
	cartProductsInterface,
	idsInArrayMethodInterface,
} from '../interfaces/products.interfaces';
// * Models
import ProductsModel from '../models/products.model';
// * Config
import mongoose from '../config/mongodb.config';

// ! Controller
class ProductControllerClass {
	constructor() {}
	async isStockAvailable(productId: mongoose.Types.ObjectId, color: string, amount: number): Promise<boolean> {
		const productData: productPropertiesInterface | null = await ProductsModel.findById(productId);
		if (productData !== null) {
			const colorIndex: number = productData.colors.indexOf(color);
			if (productData.stock[colorIndex] >= amount) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Error('Product not found');
		}
	}
	async isValidProduct(cartProductProperties: cartProductsInterface): Promise<boolean> {
		if (await this.exists(cartProductProperties._id)) {
			const productData: productPropertiesInterface | null = await ProductsModel.findById(
				cartProductProperties._id
			);
			if (productData === null) {
				throw new Error('[ProductController] Validate Product: Internal Server Error');
			}
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
	async exists(productId: mongoose.Types.ObjectId): Promise<Boolean> {
		if ((await ProductsModel.findById(productId)) !== null) {
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
			if (!(await this.exists(product._id))) {
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

		const newProduct: mongoose.Document = new ProductsModel(new ProductClass(productProperties));
		const savedProduct: mongoose.Document = await newProduct.save();

		if (savedProduct !== null) {
			return savedProduct._id;
		} else {
			throw new Error('There was an error saving the product in the DB');
		}
	}
	async getById(productId: mongoose.Types.ObjectId): Promise<ProductClass | null> {
		const productFound: productPropertiesInterface | null = await ProductsModel.findById(productId);

		if (productFound !== null) {
			return new ProductClass(productFound);
		}
		return productFound;
	}
	async getCategoryById(categoryId: number): Promise<ProductClass[]> {
		const categodyProducts: productPropertiesInterface[] | null = await ProductsModel.find({
			categoryId: { $eq: categoryId },
		});
		if (categodyProducts === null) {
			return [];
		} else {
			let products: ProductClass[] = [];
			categodyProducts.forEach((productProperties) => {
				products = [...products, new ProductClass(productProperties)];
			});
			return products;
		}
	}
	async getAll(): Promise<ProductClass[]> {
		let products: ProductClass[] = [];
		const productsData: productPropertiesInterface[] = await ProductsModel.find({});

		productsData.forEach((productProperties) => {
			products = [...products, new ProductClass(productProperties)];
		});

		return products;
	}
	async deleteById(productId: mongoose.Types.ObjectId): Promise<void> {
		if ((await this.exists(productId)) == false) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			await ProductsModel.deleteOne({
				_id: { $eq: productId },
			});
		}
	}
	async deleteAll(): Promise<void> {
		await ProductsModel.deleteMany({});
	}
	async modifyById(
		productId: mongoose.Types.ObjectId,
		newProductProperties: productPropertiesInterface
	): Promise<void> {
		if ((await this.exists(productId)) == false) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			const productFound: productPropertiesInterface | null = await ProductsModel.findById(productId);
			if (productFound !== null) {
				const productInstance: ProductClass = new ProductClass(productFound);

				await ProductsModel.updateOne(
					{ _id: productId },
					{ $set: { ...productInstance, ...newProductProperties } }
				);
			}
		}
	}
	async getValidProduct(
		productId: mongoose.Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<CartProductClass> {
		if (await ProductsController.exists(productId)) {
			const productDocument: ProductClass | null = await ProductsController.getById(productId);
			if (productDocument === null) {
				throw new Error('Internal server error');
			}

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
