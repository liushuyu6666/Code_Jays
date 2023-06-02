import bcrypt from 'bcryptjs';
import mysql, { Connection as MysqlConnection } from 'mysql';
import { MongoClient } from 'mongodb';

// TODO: configurable
const DATABASE_NAME = 'codejays';
const MONGO_URI = 'mongodb://127.0.0.1:27017/CodeJays';

export type DbCallbackFn<T> = (client: MongoClient | MysqlConnection) => Promise<T>;

export type DbOperation = <T>(callback: DbCallbackFn<T>) => Promise<T>;


export enum DatabaseType {
    MongoDB,
    MySQL
} 

export class DatabaseRepository {
    public dbOperation: DbOperation;

    constructor(databaseType: DatabaseType) {
        switch(databaseType) {
            case DatabaseType.MongoDB:
                this.dbOperation = this.mongodbOperation();
                break;
            case DatabaseType.MySQL:
                this.dbOperation = this.mysqlOperation();
                break;
            default:
                throw new Error('Invalid database type');
        }
    }

    private mongodbOperation(): DbOperation {
        return async (callback) => {
            const connection = await MongoClient.connect(MONGO_URI);
            try {
                const result = await callback(connection);
                return result;
            } catch(error) {
                throw error;
            } finally {
                await connection.close();
            }
        };
    }

    private mysqlOperation(): DbOperation {
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

    /** For Mongodb */
    public async existsCollection(colName: string): Promise<boolean> {
        return await this.dbOperation(async (client) => {
            const col = await (client as MongoClient)
                .db()
                .listCollections({
                    name: colName,
                })
                .toArray();
            return col.length > 0;
        });
    }

    /** For Mongodb */
    public async createCollectionIfNotExists(colName: string): Promise<void> {
        const colExists = await this.existsCollection(colName);
        if (colExists) return;

        await this.dbOperation(async (client) => {
            await (client as MongoClient).db().createCollection(colName);
        });
    }

    public encryptPassword(password: string): string {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    /** For Mysql */
    public async execSql(sql: string, values: (string | Date)[]): Promise<any> {
        return await this.dbOperation(async (client) => {
            return new Promise((res, rej) => {
                (client as MysqlConnection).query(sql, values, (error, result) => {
                    if (error) rej(error);
                    else res(result);
                });
            });
        });
    }

    /** For Mysql */
    public async existsTable(table: string): Promise<boolean> {
        const sql = `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1`;
        const values = [DATABASE_NAME, table];

        const result = await this.execSql(sql, values);
        return result.length > 0;
    }

    /** For Mysql */
    public async createUserTableIfNotExists(): Promise<void> {
        const tableExists = await this.existsTable('user');
        if(tableExists) return;
        const sql = `
            CREATE TABLE user (
                userId VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL
            )
        `;
        await this.execSql(sql, []);
        
        // TODO: logger
        console.log("Create user table in mysql");
    }

    /** For Mysql */
    public async createImageTableIfNotExists(): Promise<void> {
        const tableExists = await this.existsTable('image');
        if (tableExists) return;
        const sql = `
            CREATE TABLE image (
                imageId VARCHAR(255) PRIMARY KEY,
                userId VARCHAR(255) NOT NULL,
                fileName VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                uploadDate TIMESTAMP NOT NULL
            )
        `;
        await this.execSql(sql, []);

        // TODO: logger
        console.log('Create image table in mysql');
    }
}