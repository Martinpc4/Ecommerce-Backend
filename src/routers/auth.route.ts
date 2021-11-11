// ! Imports
import express, { Request, Response } from 'express';
import passport from '../auth/passport.auth';
import logger from '../logs/index.logs';

// ! Route Definition

// * AUTH Router
const AUTH = express.Router();

// ! Routes

// * Local Auth
//  Log In
AUTH.get('/login', (req: Request, res: Response) => {
    try {
        res.render('login_form');
    } catch (err) {
        logger.error({
            message: 'Login form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/login',
            stack: err,
        });
        res.status(500).send('Internal Server Error');
    }
});
AUTH.get('/faillogin', (req: Request, res: Response) => {
    try {
        res.render('fail_login');
        logger.notice({
            message: 'Login form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/faillogin',
        });
    } catch (err) {
        logger.error({
            message: 'Login Fail form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/faillogin',
            stack: err,
        });
        res.status(500).send('Internal Server Error');
    }
});
AUTH.post(
    '/login',
    passport.authenticate('login', {
        failureRedirect: '/auth/faillogin',
    }),
    (req: Request, res: Response) => {
        res.status(200).redirect(`${process.env.HOME_ROUTE}`);
    }
);

// Sign Up
AUTH.get('/signup', (req: Request, res: Response) => {
    try {
        res.render('signup_form');
    } catch (err) {
        logger.error({
            message: 'Signup form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/signup',
            stack: err,
        });
        res.status(500).send('Internal Server Error');
    }
});
AUTH.get('/failsignup', (req: Request, res: Response) => {
    try {
        res.render('fail_signup');+
        logger.notice({
            message: 'Signup form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/failsignup',
        });
    } catch (err) {
        logger.error({
            message: 'Signup Fail form failure',
            router: 'AUTH',
            method: 'GET',
            route: '/failsignup',
            stack: err,
        });
        res.status(500).send('Internal Server Error');
    }
});
AUTH.post(
    '/signup',
    passport.authenticate('signup', { failureRedirect: '/auth/failsignup' }),
    (req: Request, res: Response) => {
        res.status(200).redirect(`${process.env.HOME_ROUTE}`);
    }
);

// * Facebook Auth
AUTH.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
AUTH.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/faillogin' }),
    (req: Request, res: Response) => {
        res.status(200).redirect(`${process.env.HOME_ROUTE}`);
    }
);

// * Github Auth
AUTH.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
AUTH.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/faillogin' }),
    (req: Request, res: Response) => {
        res.status(200).redirect(`${process.env.HOME_ROUTE}`);
    }
);

// ! Exports
export default AUTH;
