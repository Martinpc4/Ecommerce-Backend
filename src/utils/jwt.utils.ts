// ! Imports
// * Modules
import * as jwt from 'jsonwebtoken';
// * Classes
import { SecureUserClass } from '../classes/users.classes';
// * Utils
import env from './env.utils';

// ! JWT Util Function Defintion
function issueJWT(userInstance: SecureUserClass): string {
	const payload = {
		_id: userInstance._id,
		expiresIn: env.JWT_EXPIRY,
	};
	const signedToken = jwt.sign(payload, env.PRIVATE_KEY, { expiresIn: env.JWT_EXPIRY, algorithm: 'RS256' });

	return `Bearer ${signedToken}`;
}

// ! Exports
export { issueJWT };