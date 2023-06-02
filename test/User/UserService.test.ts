import { DatabaseType } from '../../src/Database/DatabaseRepository';
import { User } from '../../src/User/User';
import { UserRepositoryFactory } from '../../src/User/UserRepository';
import { UserService } from '../../src/User/UserService';
import bcrypt from 'bcryptjs';

const mockUser = new User('userId', 'username', 'hashedPassword', 'email');

const mockCreateUserRepository = {
    getUserByEmail: jest.fn(),
    addUser: jest.fn(),
};

jest.spyOn(UserRepositoryFactory, 'createUserRepository').mockImplementation(
    () => mockCreateUserRepository
);

describe('Test UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService(DatabaseType.MongoDB);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        test('should return message if the user exists', async () => {
            mockCreateUserRepository.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
            mockCreateUserRepository.addUser = jest.fn().mockResolvedValue(undefined);
            const result = await userService.registerUser(
                'username',
                'password',
                'email',
            );

            expect(result).toBe('User with the same email already exists');
        });

        test('should return the new User if no user exists', async () => {
            mockCreateUserRepository.getUserByEmail = jest.fn().mockResolvedValue(undefined);
            mockCreateUserRepository.addUser = jest.fn().mockResolvedValue(mockUser);
            const result = await userService.registerUser(
                'username',
                'password',
                'email',
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe('verifyUserAndReturnUserId', () => {
        test('should return undefined if no email', async () => {
            const result = await userService.verifyUserAndReturnUserId(undefined, undefined);

            expect(result).toBe(undefined);
        });

        test('should return undefined if no login user', async () => {
            mockCreateUserRepository.getUserByEmail = jest.fn().mockResolvedValue(undefined);
            
            const result = await userService.verifyUserAndReturnUserId('email', undefined);

            expect(mockCreateUserRepository.getUserByEmail).toBeCalledTimes(1);
            expect(result).toBe(undefined);
        });

        test('should return userId if the password is right', async () => {
            mockCreateUserRepository.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
            
            const result = await userService.verifyUserAndReturnUserId('email', 'password');

            expect(mockCreateUserRepository.getUserByEmail).toBeCalledTimes(1);
            expect(bcrypt.compareSync).toBeCalledTimes(1);
            expect(result).toBe('userId');
        });

        test('should return undefined if the password is wrong', async () => {
            mockCreateUserRepository.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
            
            const result = await userService.verifyUserAndReturnUserId('email', 'password');

            expect(mockCreateUserRepository.getUserByEmail).toBeCalledTimes(1);
            expect(bcrypt.compareSync).toBeCalledTimes(1);
            expect(result).toBe(undefined);
        });
    })
});
