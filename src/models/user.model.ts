import * as mongoose from 'mongoose';

export type UserModel = mongoose.Document & {
    username: string,
};

const userSchema = new mongoose.Schema({
    username: String,
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;
