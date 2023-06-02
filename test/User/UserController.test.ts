import { AuthService } from '../../src/Auth/AuthService';
import { DatabaseType } from '../../src/Database/DatabaseRepository';
import { User } from '../../src/User/User';
import { UserController } from '../../src/User/UserController';
import { UserService } from '../../src/User/UserService';

const mockReqFunc = (
    username: string | undefined,
    password: string | undefined,
    email: string | undefined,
) => {
    return {
        body: {
            username,
            password,
            email,
        },
    };
};

const mockUser = new User('userId', 'username', 'hashedPassword', 'email');

describe('UserController', () => {
    let userController: UserController;
    let mockReq: any;
    let mockRes: any;

    describe('uploadImageToS3', () => {
        beforeEach(() => {
            userController = new UserController(DatabaseType.MongoDB);

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('return 400 when there is no username', async () => {
            mockReq = mockReqFunc(undefined, 'password', 'email');

            const result = await userController.registerUser(mockReq, mockRes);

            expect(mockRes.status).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(400);
            expect(result.json).toBeCalledWith({
                error: 'Username, password, and email are required',
            });
        });

        test('return 409 when there is a duplicated user', async () => {
            mockReq = mockReqFunc('tester', 'password', 'email');
            jest.spyOn(UserService.prototype, 'registerUser').mockResolvedValue('there is an error');

            const result = await userController.registerUser(mockReq, mockRes);

            expect(UserService.prototype.registerUser).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(409);
            expect(result.json).toBeCalledWith({
                error: 'there is an error'
            });
        });

        test('return 201 when the user is created', async () => {
            mockReq = mockReqFunc('tester', 'password', 'email');
            jest.spyOn(UserService.prototype, 'registerUser').mockResolvedValue(mockUser);

            const result = await userController.registerUser(mockReq, mockRes);

            expect(UserService.prototype.registerUser).toBeCalledTimes(1);
            expect(result.status).toBeCalledWith(201);
            expect(result.json).toBeCalledWith({
                message: 'User registered successfully'
            });
        });
    });

    describe('loginUser', () => {
        beforeEach(() => {
            userController = new UserController(DatabaseType.MongoDB);

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('return 401 when the user does not exist', async () => {
            mockReq = mockReqFunc(undefined, 'password', 'email');
            jest.spyOn(UserService.prototype, 'verifyUserAndReturnUserId').mockResolvedValue(undefined);

            const result = await userController.loginUser(mockReq, mockRes);

            expect(result.status).toBeCalledWith(401);
            expect(result.json).toBeCalledWith({
                error: 'Invalid email or password'
            });
        });

        test('return 200 when log in successfully', async () => {
            mockReq = mockReqFunc(undefined, 'password', 'email');
            jest.spyOn(UserService.prototype, 'verifyUserAndReturnUserId').mockResolvedValue('userId');
            jest.spyOn(AuthService.prototype, 'generateToken').mockReturnValue('token');

            const result = await userController.loginUser(mockReq, mockRes);

            expect(result.status).toBeCalledWith(200);
            expect(result.json).toBeCalledWith({ message: 'User logged in successfully', token: 'token' });
        });
    })
});
