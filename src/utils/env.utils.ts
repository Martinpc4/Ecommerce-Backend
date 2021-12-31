// ! Imports
// * Modules
import dotenv from 'dotenv';

// ! Environment Varaibles Config
// * Configure dotenv to load variables from the .env file
dotenv.config();

// * Environment Variables Verification
if (process.env.NODE_ENV === undefined) {
    throw new Error('NODE_ENV is not defined');
}
if (process.env.PORT === undefined) {
    throw new Error('PORT is not defined');
}
if (process.env.MONGODB_URI === undefined) {
    throw new Error('MONGODB_URI is not defined');
}
if (process.env.LOGGER_LEVEL === undefined) {
    throw new Error('LOGGER_LEVEL is not defined');
}
if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined');
}
if (process.env.JWT_EXPIRY === undefined) {
    throw new Error('JWT_EXPIRY is not defined');
}
if (process.env.COOKIE_SESSION_SECRET === undefined) {
    throw new Error('COOKIE_SESSION_SECRET is not defined');
}
if (process.env.FACEBOOK_APP_ID === undefined) {
    throw new Error('FACEBOOK_APP_ID is not defined');
}
if (process.env.FACEBOOK_APP_SECRET === undefined) {
    throw new Error('FACEBOOK_APP_SECRET is not defined');
}
if (process.env.SERVER_ADDRESS === undefined) {
    throw new Error('SERVER_ADDRESS is not defined');
}
if (process.env.GITHUB_CLIENT_ID === undefined) {
    throw new Error('GITHUB_CLIENT_ID is not defined');
}
if (process.env.GITHUB_CLIENT_SECRET === undefined) {
    throw new Error('GITHUB_CLIENT_SECRET is not defined');
}
if (
    process.env.NODEMAILER_USER_PROD === undefined ||
    process.env.NODEMAILER_PASSWORD_PROD === undefined ||
    process.env.NODEMAILER_HOST_PROD === undefined
) {
    throw new Error('Nodemailer Production credentials are not defined');
}
if (
    process.env.NODEMAILER_USER_DEV === undefined ||
    process.env.NODEMAILER_PASSWORD_DEV === undefined ||
    process.env.NODEMAILER_HOST_DEV === undefined
) {
    throw new Error('Nodemailer Development credentials are not defined');
}
if (process.env.PUBLIC_KEY === undefined || process.env.PRIVATE_KEY === undefined) {
    throw new Error('Cryptographic key pair is not defined');
}

// * Object Contruction
const environmentVariables = {
    // Internal Server Variables
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SERVER_ADDRESS: process.env.SERVER_ADDRESS,
    // Logger Variables
    LOGGER_LEVEL: process.env.LOGGER_LEVEL,
    // MongoDB Database Variables
    MONGODB_URI: process.env.MONGODB_URI,
    // JWT Variables
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    // Cookie Session Variables
    COOKIE_SESSION_SECRET: process.env.COOKIE_SESSION_SECRET,
    // Passport Authentication Variables
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    // Nodemailer Variables
    NODEMAILER_USER_PROD: process.env.NODEMAILER_USER_PROD,
    NODEMAILER_PASSWORD_PROD: process.env.NODEMAILER_PASSWORD_PROD,
    NODEMAILER_HOST_PROD: process.env.NODEMAILER_HOST_PROD,
    NODEMAILER_USER_DEV: process.env.NODEMAILER_USER_DEV,
    NODEMAILER_PASSWORD_DEV: process.env.NODEMAILER_PASSWORD_DEV,
    NODEMAILER_HOST_DEV: process.env.NODEMAILER_HOST_DEV,
    // Cryptography
    PUBLIC_KEY: `${process.env.PUBLIC_KEY}`.replace(/\\n/g, '\n'),
    PRIVATE_KEY: `${process.env.PRIVATE_KEY}`.replace(/\\n/g, '\n'),
};

// ! Exports
export default environmentVariables;
