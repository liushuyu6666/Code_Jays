import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/Auth/AuthService';

const mockTodayTimestamp = Math.floor(
    new Date().getTime() / 1000,
);

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        test('should return encoded string', () => {
            jest.spyOn(jwt, 'sign').mockImplementation(() => {
                return 'jwt-encoded-string';
            });

            const result = authService.generateToken('userId');

            expect(result).toBe('jwt-encoded-string');
        });
    });

    describe('authenticateToken', () => {
        test('should throw error if token is expired', () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                return {
                    exp: 946684800,
                };
            });

            expect(() => authService.authenticateToken('token')).toThrowError(
                'The token is expired',
            );
        });

        test('should return decoded token if it is verified', () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                return {
                    exp: mockTodayTimestamp,
                    userId: 'user1',
                };
            });

            const result = authService.authenticateToken('token');

            expect(result).toEqual({
                exp: mockTodayTimestamp,
                userId: 'user1'
            })
        });

        test('should throw error if the token is invalid', () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => authService.authenticateToken('token')).toThrowError(
                'Invalid token',
            );
        });
    });
});
