import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcryptjs';

import { User } from './User';

const users: User[] = [];

export class UserRepository {
    static addUser(username: string, password: string, email: string): User {
        // Encrypt the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Generate id
        const id = uuidv4();

        const newUser = new User(id, username, hashedPassword, email);

        // TODO: add to the database here!
        users.push(newUser);

        return newUser;
    }

    static getUserByEmail(email: string): User | undefined {
        return users.find(user => user.email === email);
    }
}
