import mongoose, { Document, Schema } from 'mongoose';

export class User extends Document {
    public id: string;
    public username: string;
    public password: string;
    public email: string;

    constructor(id: string, username: string, hashedPassword: string, email: string) {
        super();
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = hashedPassword;
    }
}

const userSchema = new Schema<User>({
    id: String,
    username: String,
    password: String,
    email: String,
});

export const UserModel = mongoose.model<User>('User', userSchema);