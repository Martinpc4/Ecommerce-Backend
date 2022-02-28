// ! Imports
// * Modules
import yargs from 'yargs';
// * Interfaces
import { argumentInterface } from '../models/interfaces/util.interface';

// ! Yargs Configuration
const defaultArgs: argumentInterface = { storage: 'memory' };

// ! Exports
export default yargs(process.argv.slice(2)).default(defaultArgs).parseSync();
