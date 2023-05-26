import { MongoClient } from 'mongodb';
import mysql, { Connection } from 'mysql';

const MONGO_URI = 'mongodb://127.0.0.1:27017/CodeJays';

export type DbCallbackFn<T> = (client: MongoClient) => Promise<T>;

export type DbOperation = <T>(callback: DbCallbackFn<T>) => Promise<T>;

export default function mongodbOperation(): DbOperation {
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

// TODO: maybe we can make it a higher order function and close the connection at the end
export const mysqlConnection: Connection = mysql.createConnection({
    host: 'localhost',
    user: 'codejays',
    password: 'password',
    database: 'codejays',
});

export async function connectToMysql() {
    mysqlConnection.connect((err) => {
        if (err) {
            // TODO: logger please
            console.error('Error connecting to MySQL database:', err);
            return;
        }
        console.log('Connected to MySQL database.');
    });

    // TODO: close mysql connection
}
