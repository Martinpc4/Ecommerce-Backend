// ! Imports
// * Modules
import { Strategy as LStrategy } from 'passport-local';
import dotenv from 'dotenv';
import { Request } from 'express';
// * Controllers
import userController, { UserClass } from '../controllers/user.controller';
// * MongoDB (DB)
import mongoose from '../mongodb';
// Models
import UserModel from '../models/users.model';
// * Inerfaces
import { userProperties } from '../interfaces/controller.interfaces';

// ! Environment Variables Module
dotenv.config();

// ! Github Strategy
const SignupLocalStrategy = new LStrategy(
    { passReqToCallback: true, passwordField: 'password', usernameField: 'email' },
    async (req: Request, username: string, password: string, done: any): Promise<void> => {
        try {
            if (await userController.isUserByUsername(username)) {
                done(null, false); // User Found in Database
            } else {
                if (req.body.name !== undefined && req.body.lastName !== undefined) {
                    const userProperties: userProperties = {
                        _id: new mongoose.Types.ObjectId(),
                        password: password,
                        name: req.body.name,
                        lastName: req.body.lastName,
                        timeStamp: new Date(),
                        email: username,
                        cartId: undefined,
                    };
                    const newUser: UserClass = new UserClass(userProperties);
                    await userController.createUser(newUser);
                    if (await userController.isUserByUsername(username)) {
                        return done(null, newUser);
                    } else {
                        return done(null, false); // User not added to database by error
                    }
                } else {
                    return done(null, false); // Missing user data
                }
            }
        } catch (err) {
            done(null, err); // General Error
        }
    }
);

const LoginLocalStrategy = new LStrategy(async (username, password, done) => {
    const userData = await UserModel.findOne({
        email: { $eq: username },
    });

    if (!userData) {
        return done(null, false);
    }

    if (userData.password !== password) {
        return done(null, false);
    } else {
        return done(null, userData);
    }
});

// ! Exports
export { LoginLocalStrategy, SignupLocalStrategy };
