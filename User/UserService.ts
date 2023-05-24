import { User } from "./User";
import { UserRepository } from "./UserRepository";

export class UserService {
    static registerUser(username: string, password: string, email: string): User | string {
        // Check if user with the same email already exists.
        const existingUser = UserRepository.getUserByEmail(email);
        if (existingUser) {
            return 'User with the same email already exists';
        }

        // Create a new User.
        // TODO: handle with the error from database.
        const newUser = UserRepository.addUser(username, password, email);

        return newUser;
    }

    // TODO: add verify function for authentication later.
}