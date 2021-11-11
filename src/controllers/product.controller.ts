// ! Imports
import {
    productProperties,
    idsInArrayMethod,
    UserProducts,
} from '../interfaces/controller.interfaces';
import mongoose from 'mongoose';
import ProductsModel from '../models/products.model';
import ProductModel from '../models/products.model';

// ! Classes

// * Products
class ProductClass {
    name: string;
    _id: mongoose.Types.ObjectId;
    description: string;
    price: number;
    imagesURL: string[];
    timeStamp: Date;
    stock: number;
    constructor(productProperties: productProperties) {
        (this.timeStamp = productProperties.timeStamp),
            (this.stock = Number(productProperties.stock)),
            (this.name = productProperties.name),
            (this._id = productProperties._id),
            (this.description = productProperties.description),
            (this.price = Number(productProperties.price)),
            (this.imagesURL = productProperties.imagesURL);
    }
}

// * Products Lists
class ProductListClass {
    constructor() {}
    async isStockAvailable(
        productId: string,
        amount: number
    ): Promise<boolean> {
        const productData: productProperties | null =
            await ProductsModel.findById(
                new mongoose.Types.ObjectId(productId)
            );
        if (productData !== null) {
            if (productData.stock >= amount) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('Product not found');
        }
    }
    async isInArray(productId: string): Promise<Boolean> {
        if (
            (await ProductsModel.findById(
                new mongoose.Types.ObjectId(productId)
            )) !== null
        ) {
            return true;
        } else {
            return false;
        }
    }
    async areIdsInArray(products: UserProducts[]): Promise<idsInArrayMethod> {
        let flagVar: boolean = true;
        let missingProductIds: string[] = [];
        let withoutStock: string[] = [];

        for await (const product of products) {
            if (!(await this.isInArray(product.productId))) {
                flagVar = false;
                missingProductIds = [...missingProductIds, product.productId];
            }
            if (
                !(await this.isStockAvailable(
                    product.productId,
                    product.amount
                ))
            ) {
                flagVar = false;
                withoutStock.push(product.productId);
            }
        }

        return { state: flagVar, missingProductIds, withoutStock };
    }
    async save(
        productProperties: productProperties
    ): Promise<mongoose.Types.ObjectId> {
        productProperties._id = new mongoose.Types.ObjectId();
        productProperties.timeStamp = new Date();

        const newProduct: mongoose.Document = new ProductsModel(
            new ProductClass(productProperties)
        );
        const savedProduct: mongoose.Document = await newProduct.save();

        return savedProduct._id;
    }
    async getById(productId: string): Promise<productProperties | null> {
        if (!(await this.isInArray(productId))) {
            throw new Error(
                `Product with id:${productId} is not found in the database`
            );
        }

        const productFound: productProperties | null =
            await ProductsModel.findById(
                new mongoose.Types.ObjectId(productId)
            );
        return productFound;
    }
    async getAll(): Promise<mongoose.Document[]> {
        const productsData: mongoose.Document[] = await ProductsModel.find({});
        return productsData;
    }
    async getProductsArrayByIds(
        products: UserProducts[]
    ): Promise<productProperties[]> {
        let productsArray: productProperties[] = [];
        for await (const product of products) {
            if (
                (await this.isInArray(product.productId)) === true &&
                (await this.isStockAvailable(product.productId, product.amount))
            ) {
                const productData: productProperties | null =
                    await this.getById(product.productId);

                if (productData !== null) {
                    productData.stock = product.amount;

                    productsArray = [...productsArray, productData];
                }
            } else {
                throw new Error(
                    'Selected product does not exist in the database or does not have stock available'
                );
            }
        }
        return productsArray;
    }
    async deleteById(productId: string): Promise<void> {
        if ((await this.isInArray(productId)) == false) {
            throw new Error(
                `el producto con id${productId}, no fue encontrado`
            );
        } else {
            await ProductsModel.deleteOne({
                _id: new mongoose.Types.ObjectId(productId),
            });
        }
    }
    async deleteAll(): Promise<void> {
        ProductsModel.deleteMany({});
    }
    async modifyById(
        productId: string,
        newProductProperties: productProperties
    ): Promise<void> {
        if ((await this.isInArray(productId)) == false) {
            throw new Error(
                `el producto con id${productId}, no fue encontrado`
            );
        } else {
            console.log(newProductProperties);
            const productFound: productProperties | null =
                await ProductsModel.findById(
                    new mongoose.Types.ObjectId(productId)
                );
            if (productFound !== null) {
                console.log(productFound);
                const productData: productProperties = new ProductClass(
                    productFound
                );

                await ProductModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(productId) },
                    { $set: { ...productData, ...newProductProperties } }
                );
            } else {
                throw new Error('Internal server error');
            }
        }
    }
}

// !  Products List Array
const productsList: ProductListClass = new ProductListClass();

// ! Exports
export { ProductClass, ProductListClass, productsList };
export default productsList;
