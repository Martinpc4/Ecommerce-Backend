// ! Imports
import { userProperties } from '../interfaces/controller.interfaces';
import mongoose from 'mongoose';
import UserModel from '../models/users.model';

// ! Classes

// * Products
class UserClass {
    name: string;
    _id: mongoose.Types.ObjectId;
    lastName: string;
    timeStamp: Date;
    email: string;
    cartId: mongoose.Types.ObjectId | undefined;
    password: string;
    constructor(userProperties: userProperties) {
        this._id = userProperties._id;
        this.name = userProperties.name;
        this.lastName = userProperties.lastName;
        this.timeStamp = userProperties.timeStamp;
        this.email = userProperties.email;
        this.cartId = userProperties.cartId;
        this.password = userProperties.password;
    }
}

// * Products Lists
class UserControllerClass {
    constructor() {}
    async isUserByUsername(username: string): Promise<boolean> {
        try {
            const userData = await UserModel.findOne({ email: { $eq: username } });
            if (!userData) {
                return false;
            }
            else {
                return true;
            }
        } catch (err) {
            throw new Error(`\n"isUserByUsername" Error: $\n\n{err}`);
        }
    }
    async isUserById(userId: string): Promise<boolean> {
        try {
            const userData: userProperties | null = await UserModel.findById(
                new mongoose.Types.ObjectId(userId)
            );
            if (userData !== null) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            throw new Error(`\n"isUserById" Error: $\n\n{err}`);
        }
    }
    async createUser(userProperties: userProperties): Promise<boolean> {
        try {
            const newUser: mongoose.Document = new UserModel(new UserClass(userProperties));

            await newUser.save();

            if (await this.isUserById(String(userProperties._id))) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            throw new Error(`\n"createUser" Error: $\n\n{err}`);
        }
    }
    async removeUser(userId: string) {
        try {
            if (await this.isUserById(userId)) {
                const newUser = await UserModel.deleteOne(new mongoose.Types.ObjectId(userId));
                if (!(await this.isUserById(userId))) {
                    throw new Error('Remove user request failed: user not successfully removed');
                }
            } else {
                throw new Error('"removeUser" Error : userId not found');
            }
        } catch (err) {
            throw new Error(`\n"removeUser" Error: $\n\n{err}`);
        }
    }
    async getUserById(userId: string): Promise<userProperties> {
        try {
            if (await this.isUserById(userId)) {
                const userData: userProperties | null = await UserModel.findById(
                    new mongoose.Types.ObjectId(userId)
                );
                if (userData !== null) {
                    return userData;
                } else {
                    throw new Error('Get user request failed: user not successfully retrieved');
                }
            } else {
                throw new Error('Get user request failed: user not found');
            }
        } catch (err) {
            throw new Error(`\n"getUserById" Error: $\n\n{err}`);
        }
    }
    async getUserByUsername (username: string): Promise<userProperties> {
        try {
            if (await this.isUserByUsername(username)) {
                const userData: userProperties | null = await UserModel.findOne({ email: {$eq : username}});
                if (userData !== null) {
                    return userData;
                } else {
                    throw new Error('Get user request failed: user not successfully retrieved');
                }
            } else {
                throw new Error('Get user request failed: user not found');
            }
        } catch (err) {
            throw new Error(`\n"getUserByUsername" Error: $\n\n{err}`);
        }
    }
}

// !  Products List Array
const userController: UserControllerClass = new UserControllerClass();

// ! Exports
export { UserClass };
export default userController;
