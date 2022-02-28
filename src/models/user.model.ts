// ! Imports
// * Modules
import { Schema, model } from 'mongoose';
// * Interfaces
import { unsecureUserPropertiesInterface } from './interfaces/user.interface';
import { Types } from 'mongoose';

// ! Model's Schema Definition
const userSchema: Schema = new Schema<unsecureUserPropertiesInterface>({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: true },
	lastName: { type: String, required: true },
	password: { type: String, required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
	email: {
		email: { type: String, required: true, unique: true },
		verified: { type: Boolean, required: true },
		verification_code: { type: Types.ObjectId, required: true, default: new Types.ObjectId() },
	},
	cartId: { type: Schema.Types.Mixed, default: null },
	role: { type: String, required: true },
	address: {
		postalCode: { type: Number, required: true },
		street: { type: String, required: true },
		streetNumber: { type: Number, required: true },
		city: { type: String, required: true },
		country: { type: String, required: true },
		state: { type: String, required: true },
	},
	phoneNumber: {
		extension: { type: Number, required: true },
		number: { type: Number, required: true },
	},
	linkedAccounts: {
		facebook: { type: Schema.Types.Mixed, default: null },
		github: { type: Schema.Types.Mixed, default: null },
	},
});

// ! Model's Instance
const UserModel = model<unsecureUserPropertiesInterface>('users', userSchema);

// ! Exports
export default UserModel;
