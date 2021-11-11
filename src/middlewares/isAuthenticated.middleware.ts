// ! Imports
// * Inerfaces & Types
import { NextFunction, Request, Response } from 'express';

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
};

export default isAuthenticated;