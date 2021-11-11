import mongoose from '../mongodb';
import { userProperties } from '../interfaces/controller.interfaces';

const userSchema: mongoose.Schema = new mongoose.Schema<userProperties>({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    timeStamp: { type: Date, required: true, default: new Date},
    email: { type: String, required: true, unique: true },
    cartId: {type: [mongoose.Types.ObjectId, undefined], required: true}
});

const UserModel = mongoose.model<userProperties>(
    'users',
    userSchema
);

export default UserModel;
