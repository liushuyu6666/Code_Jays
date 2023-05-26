import { MongoClient } from 'mongodb';
import mysql, { Connection as MysqlConnection } from 'mysql';

const MONGO_URI = 'mongodb://127.0.0.1:27017/CodeJays';

export type DbCallbackFn<T> = (client: MongoClient | MysqlConnection) => Promise<T>;

export type DbOperation = <T>(callback: DbCallbackFn<T>) => Promise<T>;

export function mongodbOperation(): DbOperation {
    return async (callback) => {
        const connection = await MongoClient.connect(MONGO_URI);
        try {
            const result = await callback(connection);
            return result;
        } catch(error) {
            throw error;
        } finally {
            connection.close();
        }
    };
}

export function mysqlOperation(): DbOperation {
    return async (callback) => {
        const mysqlConnection: MysqlConnection = mysql.createConnection({
            host: 'localhost',
            user: 'codejays',
            password: 'password',
            database: 'codejays',
        });
        try {
            const result = await callback(mysqlConnection);
            return result;
        } catch (error) {
            throw error;
        } finally {
            mysqlConnection.end();
        }
    }
}
