// ! Imports
// * Modules
import { Request, Response, NextFunction } from 'express';

// TODO Fix me
const admin: boolean = true;

// ! Middleware
function isAdmin(req: Request, res: Response, next: NextFunction) {
	if (admin) {
		console.log('Administrator access granted');
		next();
	} else {
		console.log('Administrator access denied');
		res.status(400).send('Access Denied');
	}
}

// ! Exports
export default isAdmin;
