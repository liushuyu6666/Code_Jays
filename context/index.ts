import { Request, Response, NextFunction } from "express";
import { MongoClient, Db } from "mongodb";

// TODO: move to .env
const MONGO_URI = "mongodb://127.0.0.1:27017/CodeJays"

export interface Context {
    userId: string;
    dbOps: (callback: (db: Db) => Promise<void>) => Promise<void>;
}

const dbOperation = (mongoUri: string) => {
    return async (callback: (db: Db) => Promise<void>) => {
        const client = await MongoClient.connect(mongoUri);
        const db = client.db();
        try {
            return await callback(db);
        } finally {
            client.close();
        }
    }
}

export const createContext = (req: Request, res: Response, next: NextFunction) => {
    const context: Context = {
        userId: '',
        dbOps: dbOperation(MONGO_URI)
    };

    (req as any).context = context;

    next();
}