// ! Imports
// * Utils
import mongoose from '../utils/mongodb';

// ! Interfaces
interface productPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	categoryId: number;
	name: string;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	stock: number[];

	colors: string[];
	memory: number;
}
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

// ! Exports
export { productPropertiesInterface, idsInArrayMethodInterface, genericProductPropertiesInterface };
