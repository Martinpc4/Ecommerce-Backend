// ! Imports
// * Modules
import { Request, Response, NextFunction } from 'express';

// ! Middleware
async function isAdmin(req: Request, res: Response, next: NextFunction) {
	// TODO Finish this
	next();
}

// ! Exports
export default isAdmin;
