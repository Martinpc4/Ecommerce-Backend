// ! Imports
// * Types
import {
	addressPropertiesInterface,
	emailPropertiesInterface,
	linkedAccountsPropertiesInterface,
	phonePropertiesInterface,
	secureUserPropertiesInterface,
	unsecureUserPropertiesInterface,
	UserRoles,
} from '../interfaces/user.interface';
import { Types } from 'mongoose';

// ! DTOs Definition
// * Unsecure User Class
class SecureUserClass implements secureUserPropertiesInterface {
	_id: Types.ObjectId;
	name: string;
	lastName: string;
	timeStamp: Date;
	email: emailPropertiesInterface;
	cartId: Types.ObjectId | null;
	address: addressPropertiesInterface;
	phoneNumber: phonePropertiesInterface;
	linkedAccounts: linkedAccountsPropertiesInterface;
	role: UserRoles;

	constructor(userProperties: secureUserPropertiesInterface) {
		this._id = userProperties._id;
		this.name = userProperties.name;
		this.lastName = userProperties.lastName;
		this.timeStamp = userProperties.timeStamp;
		this.email = {
			email: userProperties.email.email,
			verified: userProperties.email.verified,
			verification_code:
				userProperties.email.verification_code !== null ? userProperties.email.verification_code : null,
		};
		this.cartId = userProperties.cartId;
		this.role = userProperties.role;
		this.address = {
			street: userProperties.address.street,
			city: userProperties.address.city,
			state: userProperties.address.state,
			streetNumber: userProperties.address.streetNumber,
			postalCode: userProperties.address.postalCode,
			country: userProperties.address.country,
		};
		this.phoneNumber = {
			number: userProperties.phoneNumber.number,
			extension: userProperties.phoneNumber.extension,
		};
		this.linkedAccounts = {
			github: userProperties.linkedAccounts.github,
			facebook: userProperties.linkedAccounts.facebook,
		};
	}
}

// * Secure User Class
class UnsecureUserClass extends SecureUserClass implements unsecureUserPropertiesInterface {
	password: string;

	constructor(userProperties: unsecureUserPropertiesInterface) {
		super(userProperties);
		this.password = userProperties.password;
	}
}

// ! Exports
export { SecureUserClass, UnsecureUserClass };
