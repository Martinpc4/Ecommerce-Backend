// ! Imports
// * Modules
import { Request, Response, NextFunction } from 'express';

// ! Middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
	if (req.user !== undefined) {
		return next();
	} else {
		res.redirect('/auth/login');
	}
}

// ! Exports
export default isAuthenticated;
