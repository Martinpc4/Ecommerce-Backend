// ! Imports
// * Classes
import { UnsecureUserClass, SecureUserClass } from '../classes/users.classes';
// * Types
import { userPropertiesInterface } from '../interfaces/users.interfaces';
// * Models
import UsersModel from '../models/users.model';
// * Services
import mongoose from '../services/mongodb.services';

// ! Data Access Object Definition
class UsersDAO {
	constructor() {}
	//  Get Methods
	async getSecureByEmail(email: string): Promise<SecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findOne({
			'email.email': { $eq: email },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}
	async getUnsecureByEmail(email: string): Promise<UnsecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findOne({
			'email.email': { $eq: email },
		});
		if (userDocument !== null) {
			return new UnsecureUserClass(userDocument);
		}
		return null;
	}
	async getSecureById(userId: mongoose.Types.ObjectId): Promise<SecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findById(userId);
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}
	async getUnsecureById(userId: mongoose.Types.ObjectId): Promise<UnsecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findById(userId);
		if (userDocument !== null) {
			return new UnsecureUserClass(userDocument);
		}
		return null;
	}
	async getSecureByGithubId(githubId: string): Promise<SecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findOne({
			'github.id': { $eq: githubId },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}
	async getSecureByFacebookId(facebookId: string): Promise<SecureUserClass | null> {
		const userDocument: userPropertiesInterface | null = await UsersModel.findOne({
			'facebook.id': { $eq: facebookId },
		});
		if (userDocument !== null) {
			return new SecureUserClass(userDocument);
		}
		return null;
	}
	// Delete Methods
	async deleteById(userId: mongoose.Types.ObjectId): Promise<void> {
		await UsersModel.findByIdAndDelete(userId);
	}
	// Update Methods
	async updateSecureById(
		userId: mongoose.Types.ObjectId,
		secureUserInstance: SecureUserClass
	): Promise<SecureUserClass> {
		const unsecureUserInstance: UnsecureUserClass | null = await this.getUnsecureById(userId);
		if (unsecureUserInstance === null) {
			throw new Error('User not found');
		} else {
			await UsersModel.findByIdAndUpdate(userId, { ...unsecureUserInstance, ...secureUserInstance });
			const updatedUser: SecureUserClass | null = await this.getSecureById(userId);
			if (updatedUser === null) {
				throw new Error(`User [_id: ${userId}] was deleted by error`);
			}
			return updatedUser;
		}
	}
	async updatePasswordById(userId: mongoose.Types.ObjectId, hashedPassword: string): Promise<void> {
		const unsecureUserInstance: UnsecureUserClass | null = await this.getUnsecureById(userId);
		if (unsecureUserInstance === null) {
			throw new Error('User not found');
		} else {
			await UsersModel.findByIdAndUpdate(userId, { ...unsecureUserInstance, password: hashedPassword });
		}
	}
	// Create Methods
	async create(userInstance: UnsecureUserClass): Promise<void> {
		const userDocument: mongoose.Document = await UsersModel.create(userInstance);
		if (userDocument === null) {
			throw new Error('User not created');
		}
	}
}

// ! Data Access Object Instance
const UsersDAOInstance = new UsersDAO();

// ! Exports
export default UsersDAOInstance;
