// ! Imports
// * Interfaces
import { Socket } from 'socket.io';
// * Utils
import { verifyJWT } from '../utils/jwt.utils';

// ! Strategy Definition
function socketAuth(socket: Socket, next): void {
	const token: string = socket.handshake.auth.Token;
	if (verifyJWT(token)) {
		next();
	} else {
		next(new Error('Socket authentication error'));
	}
}

// ! Exports
export default socketAuth;
