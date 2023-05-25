import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcryptjs';

import { User, UserModel } from './User';

export class UserRepository {
    static async addUser(username: string, password: string, email: string): Promise<User> {
        // Encrypt the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Generate id
        const id = uuidv4();

        const user = new User(id, username, hashedPassword, email);

        const newUser = new UserModel(user);
        await newUser.save();
        return newUser;

        // return await UserModel.create(newUser);
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        return UserModel.findOne({ email }).exec();
    }
}
