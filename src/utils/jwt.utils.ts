// ! Imports
// * Modules
import { sign, verify } from 'jsonwebtoken';
// * DTOs
import { SecureUserClass } from '../models/DTOs/user.dto';
// * Interfaces
import { JwtPayload } from 'jsonwebtoken';
// * Utils
import env from './env.utils';

// ! JWT Util Function Definition
function issueJWT(userInstance: SecureUserClass): string {
	const payload = {
		_id: userInstance._id,
		expiresIn: env.JWT_EXPIRY,
	};
	const signedToken = sign(payload, env.PRIVATE_KEY, { expiresIn: env.JWT_EXPIRY, algorithm: 'RS256' });

	return `Bearer ${signedToken}`;
}
function verifyJWT(token: string): string | JwtPayload {
	if (token.indexOf('Bearer ') !== -1) {
		return verify(token.replace('Bearer ', ''), env.PUBLIC_KEY, { algorithms: ['RS256'] });
	}
	return verify(token, env.PUBLIC_KEY, { algorithms: ['RS256'] });
}

// ! Exports
export { issueJWT, verifyJWT };
