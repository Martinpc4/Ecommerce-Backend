import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.MONGO_URI !== undefined) {
    mongoose.connect(process.env.MONGO_URI, (err) => {
        if (!err) {
            console.log('Connected to the database');
        } else {
            console.log(err);
        }
    });
}
else {
    throw new Error('Mongo URI not found in ENV file');
}

export default mongoose;
