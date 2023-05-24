import jwt from 'jsonwebtoken';

// TODO: move to the .env
const secretKey = 'abcdefg';

export class AuthService {
    static generateToken(userId: string): string {
        return jwt.sign({ userId }, secretKey, { expiresIn: '6h' });
    }

    static authenticateToken(token: string): string | jwt.JwtPayload {
        try {
            const decoded = jwt.verify(token, secretKey);
            return decoded;
        } catch (error) {
            throw error;
        }
    }
}