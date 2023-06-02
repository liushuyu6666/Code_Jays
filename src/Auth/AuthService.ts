import jwt, { JwtPayload } from 'jsonwebtoken';

// TODO: move to the .env
const secretKey = 'abcdefg';

export class AuthService {
    public generateToken(userId: string): string {
        return jwt.sign({ userId }, secretKey, { expiresIn: '6h' });
    }

    public authenticateToken(token: string): string | JwtPayload {
        try {
            const decodedToken = jwt.verify(token, secretKey);
            const expirationTime = (decodedToken as JwtPayload).exp;

            const currentTime = Math.floor(Date.now() / 1000);

            if(!expirationTime || currentTime > expirationTime) {
                throw new Error('The token is expired');
            }

            return decodedToken;
        } catch (error) {
            throw error;
        }
    }
}