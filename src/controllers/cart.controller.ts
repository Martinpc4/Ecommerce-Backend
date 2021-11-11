// ! Imports
import { productsList } from './product.controller';
import {
    productProperties,
    cartProperties,
    UserProducts,
} from '../interfaces/controller.interfaces';
import mongoose from '../mongodb';
import CartModel from '../models/carts.model';
import ProductModel from '../models/products.model';

// ! Classes

// * Cart List
class CartListClass {
    constructor() {}
    async isCartInList(cartId: string): Promise<boolean> {
        if (
            (await CartModel.findById(new mongoose.Types.ObjectId(cartId))) !==
            null
        ) {
            return true;
        } else {
            return false;
        }
    }
    async isProductInCartById(
        cartId: string,
        productId: string
    ): Promise<boolean> {
        if (!(await this.isCartInList(cartId))) {
            throw new Error(`Cart with id: ${cartId} was not found`);
        }
        const cartFound: cartProperties | null = await CartModel.findById(
            new mongoose.Types.ObjectId(cartId)
        );
        if (cartFound !== null) {
            const cartInstanced: CartClass = new CartClass(cartFound);
            let flagVar: boolean = false;
            cartInstanced.products.forEach((productProperties) => {
                if (String(productProperties._id) === productId) {
                    flagVar = true;
                }
            });
            return flagVar;
        }
        throw new Error('Internal server error');
    }
    // TODO Continue Working Here
    async createCart(
        userId: string,
        productsIds: UserProducts[]
    ): Promise<CartClass> {
        const productsArray: productProperties[] =
            await productsList.getProductsArrayByIds(productsIds);

        const newCart: CartClass = new CartClass({
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(userId),
            products: productsArray,
            timeStamp: new Date(),
        });

        const cartDocument: mongoose.Document = new CartModel(newCart);
        await cartDocument.save();

        return newCart;
    }
    async removeCartById(cartId: string): Promise<void> {
        if (await this.isCartInList(cartId)) {
            await CartModel.deleteOne({
                _id: new mongoose.Types.ObjectId(cartId),
            });
        } else {
            throw new Error(`Cart with id:${cartId} was not found`);
        }
    }
    async emptyCartById(cartId: string): Promise<void> {
        if ((await this.isCartInList(cartId)) === true) {
            await CartModel.updateOne(
                { _id: new mongoose.Types.ObjectId(cartId) },
                { $set: { products: [] } }
            );
        } else {
            throw new Error(`Cart with id:${cartId} was not found`);
        }
    }
    async getAllProductsFromCartById(
        cartId: string
    ): Promise<productProperties[]> {
        let productsArray: productProperties[] = [];
        const cartDocument: cartProperties | null = await CartModel.findById(
            new mongoose.Types.ObjectId(cartId)
        );

        if (cartDocument !== null) {
            return cartDocument.products;
        }
        throw new Error('Internal server errror');
    }
    async addProductToCartById(
        cartId: string,
        productId: string,
        amount: number
    ): Promise<void> {
        if (await this.isCartInList(cartId)) {
            const cartData: cartProperties | null = await CartModel.findById(
                new mongoose.Types.ObjectId(cartId)
            );
            if (cartData !== null) {
                const cartInstance: CartClass = new CartClass(cartData);

                await cartInstance.addProductById(productId, amount);

                console.log(cartInstance);

                await CartModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(cartId) },
                    { $set: { products: cartInstance.products } }
                );
            }
        } else {
            throw new Error(`Cart with id:${cartId} was not found`);
        }
    }
    async removeProductFromCartById(
        // rebuild
        cartId: string,
        productId: string
    ): Promise<void> {
        if (await this.isCartInList(cartId)) {
            const cartData: cartProperties | null = await CartModel.findById(
                new mongoose.Types.ObjectId(cartId)
            );
            if (cartData !== null) {
                const cartInstance: CartClass = new CartClass(cartData);
                cartInstance.removeProductById(productId);
                console.log(cartInstance);
                const data = await CartModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(cartId) },
                    { $set: { products: cartInstance.products } }
                );
            }
        } else {
            throw new Error(`Cart with id:${cartId} was not found`);
        }
    }
}

// * Cart
class CartClass {
    _id: mongoose.Types.ObjectId;
    products: productProperties[];
    userId: mongoose.Types.ObjectId;
    timeStamp: Date;
    constructor(cartProperties: cartProperties) {
        (this._id = cartProperties._id),
            (this.products = cartProperties.products),
            (this.userId = cartProperties.userId),
            (this.timeStamp = cartProperties.timeStamp);
    }
    isProductInCart(productId: string): boolean {
        let flagVar = false;
        this.products.forEach((productProperties) => {
            if (String(productProperties._id) === productId) {
                flagVar = true;
            }
        });
        return flagVar;
    }
    modifyProductById(productId: string, amount: number): void {
        if (this.isProductInCart(productId) === true) {
            this.products.forEach((productProperties) => {
                if (String(productProperties._id) === productId) {
                    productProperties.stock = amount;
                }
            });
        } else {
            throw new Error('Product is not in Cart');
        }
    }
    addProduct(productProperties: productProperties): void {
        productProperties.timeStamp = new Date();
        this.products.push(productProperties);
    }
    async addProductById(productId: string, amount: number): Promise<void> {
        if (
            (await ProductModel.findById(
                new mongoose.Types.ObjectId(productId)
            )) !== null
        ) {
            if (this.isProductInCart(productId) === true) {
                this.modifyProductById(productId, amount);
            } else {
                const productData: productProperties | null =
                    await ProductModel.findById(
                        new mongoose.Types.ObjectId(productId)
                    );
                if (productData !== null) {
                    productData.stock = amount;
                    this.products.push(productData);
                } else {
                    throw new Error('Internal server error');
                }
            }
        } else {
            throw new Error(
                `The product with id ${productId} does not exist in database`
            );
        }
    }
    removeProductById(productId: string): void {
        if (this.isProductInCart(productId) === true) {
            let newProducts: productProperties[] = [];
            this.products.forEach((productProperties) => {
                if (!(String(productProperties._id) === productId)) {
                    newProducts.push(productProperties);
                }
            });
            this.products = newProducts;
        } else {
            throw new Error(
                `El producto con el id: ${productId}, no se encuenta en el carrito`
            );
        }
    }
}

//  ! Carts List Array
const cartsList: CartListClass = new CartListClass();

// ! Exports
export { CartClass, CartListClass, cartsList };
export default cartsList;
