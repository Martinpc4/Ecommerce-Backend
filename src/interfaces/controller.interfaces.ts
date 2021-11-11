// ! Imports
import mongoose from 'mongoose';

// ! Class Interfaces

// * Product-related interfaces
export interface productProperties {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    imagesURL: string[];
    timeStamp: Date;
    stock: number;
}
export interface idsInArrayMethod {
    state: boolean;
    missingProductIds: string[];
    withoutStock: string[];
}
export interface UserProducts {
    productId: string;
    amount: number;
}

// * Cart-related Interfaces
export interface cartProperties {
    _id: mongoose.Types.ObjectId;
    products: Array<productProperties>;
    userId: mongoose.Types.ObjectId;
    timeStamp: Date;
}

// * User-related Interfaces
export interface userProperties {
    _id: mongoose.Types.ObjectId;
    name: string;
    lastName: string;
    timeStamp: Date;
    email: string;
    cartId: mongoose.Types.ObjectId | undefined;
    password: string;
}

// * Messages-related Interfaces
export interface messagesProperties {
    email: string;
    timeStamp: Date;
    content: string;
}