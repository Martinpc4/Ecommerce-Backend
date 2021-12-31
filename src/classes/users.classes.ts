// ! Imports
// * Types
import {
	addressPropertiesInterface,
	emailPropertiesInterface,
	linkedAccountsPropertiesInterface,
	phonePropertiesInterface,
	userPropertiesInterface,
} from '../interfaces/users.interfaces';
// * Services
import mongoose from '../services/mongodb.services';

// ! Class Definition
// * Unsecure User Class
class SecureUserClass {
    _id: mongoose.Types.ObjectId;
    name: string;
    lastName: string;
    timeStamp: Date;
    email: emailPropertiesInterface;
    cartId: mongoose.Types.ObjectId | null;
    address: addressPropertiesInterface;
    phoneNumber: phonePropertiesInterface;
    linkedAccounts: linkedAccountsPropertiesInterface;

    constructor(userProperties: userPropertiesInterface) {
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
            facebook: userProperties.linkedAccounts.facebook
        };
    }
}

// * Secure User Class
class UnsecureUserClass extends SecureUserClass {
    password: string;

    constructor(userProperties: userPropertiesInterface) {
        super(userProperties);
        this.password = userProperties.password;
    }
}

// ! Exports
export {SecureUserClass, UnsecureUserClass};
