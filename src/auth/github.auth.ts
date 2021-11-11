// ! Imports
// * Modules
import { Strategy as GHStrategy } from 'passport-github2';
import dotenv from 'dotenv';
// * Controllers
import userController from '../controllers/user.controller';
// * MongoDB (DB)
import mongoose from '../mongodb';
// * Inerfaces
import { userProperties } from '../interfaces/controller.interfaces';

// ! Environment Variables Module
// Configuration
dotenv.config();
// Check for env variables
if (process.env.GITHUB_CLIENT_ID === undefined || process.env.GITHUB_CLIENT_SECRET === undefined) {
    throw new Error(`Github App Id or Client Secret not found in ENV file`);
}

// ! Github Strategy
const GithubStrategy = new GHStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/auth/github/callback',
        scope: ['user:email'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
            if (
                profile.name !== null &&
                profile.emails[0].value !== undefined &&
                profile.emails[0].value !== null
            ) {
                if (await userController.isUserByUsername(profile.emails[0].value)) {
                    const userData: userProperties = await userController.getUserByUsername(
                        profile.emails[0].value
                    );
                    done(null, userData);
                } else {
                    const userFullName: string[] = profile.displayName.split(' ');
                    const userData: userProperties = {
                        _id: new mongoose.Types.ObjectId(),
                        name: userFullName[0],
                        lastName: userFullName[1],
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
                        done(new Error('User Passport-Github Auth Creation Error'), null);
                    }
                }
            } else {
                done(
                    new Error('Github did not provide enough user data to register or login user'),
                    false
                );
            }
        } catch (err) {
            done(err, false);
        }
    }
);

// ! Exports
export default GithubStrategy;
