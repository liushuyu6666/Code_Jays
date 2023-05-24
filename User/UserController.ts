import { Request, Response } from "express";
import { User } from "./User";
import { UserService } from "./UserService";

const users: User[] = []; // In-memory storage for registered users

export const registerUser = (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
        return res
            .status(400)
            .json({ error: "Username, password, and email are required" });
    }

    const newUserOrError = UserService.registerUser(username, password, email);
    if(typeof newUserOrError === 'string') {
        return res.status(409).json({ error: newUserOrError });
    }

    const id = newUserOrError.id;
    return res.status(201).json({ message: `User: ${id} registered successfully, ${newUserOrError.password}, ${newUserOrError.email}`});
};
