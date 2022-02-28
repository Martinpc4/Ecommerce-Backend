// ! Imports
// * DAOs
import UserMongooseDAO from '../DAOs/user.mongoose.dao';
import UserMemoryDAO from '../DAOs/user.memory.dao';
// * Utils
import arguments from '../../utils/args.utils';

// ! Factory Definition
const storageOption: string = arguments.storage;

let UserDAO: UserMemoryDAO | UserMongooseDAO;

if (storageOption === 'mongoose') {
	UserDAO = new UserMongooseDAO();
} else {
	UserDAO = new UserMemoryDAO();
}

// ! Exports
export default UserDAO;
