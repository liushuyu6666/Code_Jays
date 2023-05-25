import { Request, Response } from "express";
import { User } from "./User";
import { UserService } from "./UserService";
import { AuthService } from "../Auth/AuthService";
import * as httpContext from 'express-http-context';


const users: User[] = []; // In-memory storage for registered users

export class UserController {
    static async registerUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
        console.log('register');
        const { username, password, email } = req.body;

        console.log(httpContext);
    
        // Validate input
        if (!username || !password || !email) {
            return res
                .status(400)
                .json({ error: "Username, password, and email are required" });
        }
    
        const newUserOrError = await UserService.registerUser(username, password, email);
        if(typeof newUserOrError === 'string') {
            return res.status(409).json({ error: newUserOrError });
        }
    
        const id = newUserOrError.id;
        return res.status(201).json({ message: `User registered successfully`});
    };

    static async loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
        const { password, email, id } = req.body;

        const loginSuccess = await UserService.verifyUser(email, password);
        if(!loginSuccess) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // TODO: add logger to display the login user
        const token = AuthService.generateToken(id);
        return res.status(200).json({ message: 'User logged in successfully', token });
    }
}
