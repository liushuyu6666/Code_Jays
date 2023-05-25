import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcryptjs';
import * as httpContext from 'express-http-context';

import { User, UserModel } from './User';
import { Db } from "mongodb";

const users: User[] = [];

export class UserRepository {
    static async addUser(username: string, password: string, email: string): Promise<User> {
        // Encrypt the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Generate id
        const id = uuidv4();

        const newUser = new User(id, username, hashedPassword, email);

        return UserModel.create(newUser);
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        return UserModel.findOne({ email }).exec();
    }
}
