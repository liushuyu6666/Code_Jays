import { DatabaseType } from '../Database/DatabaseRepository';
import { User } from './User';
import {
    UserRepository,
    UserRepositoryFactory,
} from './UserRepository';
import bcrypt from 'bcryptjs';

export class UserService {
    private userRepository: UserRepository;

    constructor(databaseType: DatabaseType) {
        this.userRepository =
            UserRepositoryFactory.createUserRepository(databaseType);
    }

    async registerUser(
        username: string,
        password: string,
        email: string,
    ): Promise<User | string> {
        // Check if user with the same email already exists.
        const existingUser = await this.userRepository.getUserByEmail(email);

        if (existingUser) {
            return 'User with the same email already exists';
        }

        // Create a new User.
        // TODO: handle with the error from database.
        const newUser = this.userRepository.addUser(username, password, email);

        return newUser;
    }

    async verifyUserAndReturnUserId(
        email?: string,
        password?: string,
    ): Promise<string | undefined> {
        if (!email) {
            return undefined;
        }

        const loginUser = await this.userRepository.getUserByEmail(email);

        if (!loginUser || !password) {
            return undefined;
        }

        if (bcrypt.compareSync(password, loginUser?.password)) {
            return loginUser.userId;
        } else {
            return undefined;
        }
    }
}
