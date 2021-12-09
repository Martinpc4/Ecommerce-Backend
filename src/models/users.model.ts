// ! Imports
// * Interfaces
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Utils
import mongoose from '../utils/mongodb';

// ! Model's Schema
const userSchema: mongoose.Schema = new mongoose.Schema<userPropertiesInterface>({
	_id: mongoose.Types.ObjectId,
	name: { type: String, required: true },
	lastName: { type: String, required: true },
	password: { type: String, required: true },
	timeStamp: { type: Date, required: true, default: new Date() },
	email: {
		email: { type: String, required: true, unique: true },
		verified: { type: Boolean, required: true },
		verification_code: { type: mongoose.Types.ObjectId, required: true, default: new mongoose.Types.ObjectId() },
	},
	cartId: { type: mongoose.Schema.Types.Mixed, default: null },
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
		facebook: { type: mongoose.Schema.Types.Mixed, default: null },
		github: { type: mongoose.Schema.Types.Mixed, default: null },
	},
});

// ! Model's Instance
const UserModel = mongoose.model<userPropertiesInterface>('users', userSchema);

// ! Exports
export default UserModel;
