// ! Imports

// * Modules
import {Request, Response, Router} from 'express';
// * Authentication
import passport from '../auth/passport.auth';
// * Classes
import {SecureUserClass} from '../classes/users.classes';
// * Utils
import env from '../utils/env.utils';
import {issueJWT} from '../utils/jwt.utils';

// ! Route Definition

// * AUTH Router
const AUTH: Router = Router();

// ! Routes

// * Local Auth
//  Log In
AUTH.post(
    '/login',
    passport.authenticate('login', {
        failureRedirect: '/auth/faillogin',
    }),
    (req: Request, res: Response) => {
        const userSessionData: any = req.user;
        if (userSessionData === undefined) {
            res.status(401).send('Unauthorized');
        } else {
            const token: string = issueJWT(new SecureUserClass(userSessionData));
            res.status(200).json({token, expiresIn: env.JWT_EXPIRY});
        }
    }
);
AUTH.get('/faillogin', (req: Request, res: Response) => {
    res.status(401).send('Invalid Credentials');
});

// Sign Up
AUTH.post(
    '/signup',
    // multer({
    // 	storage: multer.diskStorage({
    // 		destination: path.join(__dirname, '../public/images/avatars/profile'),
    // 		filename: (req: Request, file, cb) => {
    // 			if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
    // 				return cb(new Error('Only PNG, JPG and JPEG are allowed'), null);
    // 			}
    // 			cb(null, `${req.body.email}.jpg`);
    // 		},
    // 	}),
    // 	dest: path.join(__dirname, '../public/images/avatars/profile'),
    // }),
    passport.authenticate('signup', {failureRedirect: '/auth/failsignup'}),
    (req: Request, res: Response) => {
        const userSessionData: any = req.user;
        if (userSessionData === undefined) {
            res.status(401).send('Unauthorized');
        } else {
            const token: string = issueJWT(new SecureUserClass(userSessionData));
            res.status(200).json({token, expiresIn: env.JWT_EXPIRY});
        }
    }
);
AUTH.get('/failsignup', (req: Request, res: Response) => {
    res.status(400).send('Error creating a user');
});

// * Facebook Auth
AUTH.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
AUTH.get(
    '/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/auth/faillogin'}),
    (req: Request, res: Response) => {
        const userSessionData: any = req.user;
        if (userSessionData === undefined) {
            res.status(401).send('Unauthorized');
        } else {
            const token: string = issueJWT(new SecureUserClass(userSessionData));
            res.status(200).json({token, expiresIn: env.JWT_EXPIRY});
        }
    }
);

// * Github Auth
// Login
AUTH.get('/github/login', passport.authenticate('github', {scope: ['user:email']}));
AUTH.get(
    '/github/callback',
    passport.authenticate('github', {failureRedirect: '/auth/faillogin'}),
    (req: Request, res: Response) => {
        const userSessionData: any = req.user;
        if (userSessionData === undefined) {
            res.status(401).send('Unauthorized');
        } else {
            const token: string = issueJWT(new SecureUserClass(userSessionData));
            res.status(200).json({token, expiresIn: env.JWT_EXPIRY});
        }
    }
);

// ! Exports
export default AUTH;
