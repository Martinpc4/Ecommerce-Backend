// ! Imports
// * DTOs
import { CartProductClass, ProductClass } from '../models/DTOs/product.dto';
// * Factories
import ProductDAO from '../models/factories/product.factory';
// * Interfaces
import { cartProductsInterface, productPropertiesInterface } from '../models/interfaces/product.interface';
import { Types } from 'mongoose';

// ! Service Definition
class ProductServiceClass {
	async existsById(productId: Types.ObjectId): Promise<boolean> {
		return await ProductDAO.existsById(productId);
	}

	async isStockAvailable(productId: Types.ObjectId, color: string, amount: number): Promise<boolean> {
		if (await ProductDAO.existsById(productId)) {
			const productData: ProductClass = await ProductDAO.getById(productId);
			return productData.stock[productData.colors.indexOf(color)] >= amount;
		} else {
			return false;
		}
	}

	async isValidProduct(cartProductProperties: cartProductsInterface): Promise<boolean> {
		if (await ProductDAO.existsById(cartProductProperties._id)) {
			const productData: productPropertiesInterface | null = await ProductDAO.getById(cartProductProperties._id);
			if (productData.colors.indexOf(cartProductProperties.color) === -1) {
				return false;
			}
			if (productData.memory !== cartProductProperties.memory) {
				return false;
			}
			return (
				productData.stock[productData.colors.indexOf(cartProductProperties.color)] >=
				cartProductProperties.amount
			);
		} else {
			return false;
		}
	}

	async save(productProperties: productPropertiesInterface): Promise<Types.ObjectId> {
		productProperties._id = new Types.ObjectId();
		productProperties.timeStamp = new Date();

		const savedProductInstance: ProductClass = await ProductDAO.save(new ProductClass(productProperties));

		if (await ProductDAO.existsById(savedProductInstance._id)) {
			return savedProductInstance._id;
		} else {
			throw new Error('The product was not saved correctly');
		}
	}

	async getById(productId: Types.ObjectId): Promise<ProductClass | null> {
		if (await ProductDAO.existsById(productId)) {
			return await ProductDAO.getById(productId);
		} else {
			return null;
		}
	}

	async getCategoryById(categoryId: number): Promise<ProductClass[]> {
		return await ProductDAO.getByCategory(categoryId);
	}

	async getAll(): Promise<ProductClass[]> {
		return await ProductDAO.getAll();
	}

	async deleteById(productId: Types.ObjectId): Promise<void> {
		if (!(await ProductDAO.existsById(productId))) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			await ProductDAO.deleteById(productId);
		}
	}

	async modifyById(
		productId: Types.ObjectId,
		newProductProperties: productPropertiesInterface
	): Promise<ProductClass> {
		if (!(await ProductDAO.existsById(productId))) {
			throw new Error(`el producto con id${productId}, no fue encontrado`);
		} else {
			return await ProductDAO.updateById(productId, new ProductClass(newProductProperties));
		}
	}

	async getValidProduct(
		productId: Types.ObjectId,
		amount: number,
		color: string,
		memory: number
	): Promise<CartProductClass> {
		if (await ProductDAO.existsById(productId)) {
			const productDocument: ProductClass = await ProductDAO.getById(productId);

			return new CartProductClass({
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
		} else {
			throw new Error(`Product [_id:${productId}] was not found`);
		}
	}
}

// ! Service Instance
const ProductService: ProductServiceClass = new ProductServiceClass();

// ! Exports
export default ProductService;
