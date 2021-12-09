// ! Imports
// * Utils
import mongoose from '../utils/mongodb';

// ! Interfaces
interface productPropertiesInterface {
	_id: mongoose.Types.ObjectId;
	name: string;
	description: string;
	price: number;
	imagesURL: string[];
	timeStamp: Date;
	stock: number[];

	categoryId: number;
	colors: string[];
	memory: number;
}
interface idsInArrayMethodInterface {
	state: boolean;
	missingProductIds: mongoose.Types.ObjectId[];
	withoutStock: mongoose.Types.ObjectId[];
}

// ! Exports
export { productPropertiesInterface, idsInArrayMethodInterface };
