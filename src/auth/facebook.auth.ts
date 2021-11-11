// ! Imports
// * Modules
import { Strategy as FBStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
// * Controllers
import userController, { UserClass } from '../controllers/user.controller';
// * MongoDB (DB)
import mongoose from '../mongodb';
// Models
import UserModel from '../models/users.model';
// * Inerfaces
import { userProperties } from '../interfaces/controller.interfaces';

// ! Environment Variables Module
// Configuration
dotenv.config();
// Check for env variables
if (process.env.FACEBOOK_APP_ID === undefined || process.env.FACEBOOK_APP_SECRET === undefined) {
    throw new Error(`Facebbok App Id or Client Secret not found in ENV file`);
}

// ! Facebook Strategy
const FacebookSrategy = new FBStrategy(
    {
        clientID: `${process.env.FACEBOOK_APP_ID}`,
        clientSecret: `${process.env.FACEBOOK_APP_SECRET}`,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'name', 'emails', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
        if (profile.name !== undefined && profile.emails !== undefined) {
            if (await userController.isUserByUsername(profile.emails[0].value)) {
                const userData: userProperties = await userController.getUserByUsername(
                    profile.emails[0].value
                );
                done(null, userData);
            } else {
                const userData: userProperties = {
                    _id: new mongoose.Types.ObjectId(),
                    name: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    cartId: undefined,
                    timeStamp: new Date(),
                    password: `${new mongoose.Types.ObjectId()}`,
                };
                await userController.createUser(userData);

                if (await userController.isUserByUsername(profile.emails[0].value)) {
                    const userData: userProperties = await userController.getUserByUsername(
                        profile.emails[0].value
                    );
                    done(null, userData);
                } else {
                    done(new Error('User Passport-Facebook Auth Creation Error'), null);
                }
            }
        } else {
            done(
                new Error('Facebook did not provide enough user data to register or login user'),
                false
            );
        }
    }
);

// ! Exports
export default FacebookSrategy;
