// ! Imports
// * Interfaces
import { Request, Response, NextFunction } from 'express';
import { UserRoles } from '../../models/interfaces/user.interface';

// ! Middleware Definition
async function isAdmin(req: Request, res: Response, next: NextFunction) {
	const userInstance: any | undefined = req.user;
	if (userInstance === undefined || userInstance.role === undefined) {
		res.status(401).send('Unauthorized');
	} else {
		if (userInstance.role === UserRoles.admin) {
			next();
		} else {
			res.status(403).send('Forbidden');
		}
	}
}

// ! Exports
export default isAdmin;
