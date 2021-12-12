// ! Imports
// * Utils
import mongoose from '../utils/mongodb';

// ! Interfaces
interface idsInArrayMethodInterface {
	state: boolean;
	missingProductIds: mongoose.Types.ObjectId[];
	withoutStock: mongoose.Types.ObjectId[];
}
interface genericProductPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	categoryId: number;
	name: string;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	memory: number;
}
interface productPropertiesInterface extends genericProductPropertiesInterface {
	stock: number[];
	colors: string[];
}
interface cartProductsInterface extends genericProductPropertiesInterface {
	color: string;
	amount: number;
}

// ! Exports
export {
	productPropertiesInterface,
	idsInArrayMethodInterface,
	genericProductPropertiesInterface,
	cartProductsInterface,
};
