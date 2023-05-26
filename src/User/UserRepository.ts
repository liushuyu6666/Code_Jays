import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User } from './User';
import { Connection as MysqlConnection } from 'mysql';
import { DbOperation } from '../../db';

// TODO: configurable
const DATABASE_NAME = 'codejays';

class DatabaseRepository {
    encryptPassword(password: string): string {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
}

export interface UserRepository {
    addUser(username: string, password: string, email: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
}

export class MongodbUserRepository extends DatabaseRepository implements UserRepository {
    private dbOperation: DbOperation;

    constructor(dbOperation: DbOperation)  {
        super();
        this.dbOperation = dbOperation;
    }
    
    async addUser(
        username: string,
        password: string,
        email: string,
    ): Promise<User> {
        const hashedPassword = super.encryptPassword(password);

        // Generate id
        const id = uuidv4();

        await this.dbOperation(async (client) => {
            const col = client.db().collection('User');
            return col.insertOne({
                username,
                password: hashedPassword,
                email,
                userId: id
            });
        })

        return new User(id, username, hashedPassword, email);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.dbOperation(async (client) => {
            const col = client.db().collection('User');
            return col.findOne({ email });
        });

        if(!user) return null;
        return new User(user.userId, user.username, user.password, user.email);
    }
}

export class MysqlUserRepository extends DatabaseRepository implements UserRepository {
    private mysqlConnection: MysqlConnection;

    constructor(connection: MysqlConnection) {
        super();
        this.mysqlConnection = connection;
    }

    private execSql(sql: string, values: string[]): Promise<any> {
        return new Promise((res, rej) => {
            this.mysqlConnection.query(sql, values, (error, result) => {
                if (error) rej(error);
                else res(result);
            });
            // this.mysqlConnection.end();
        });
    }

    private async existsTable(table: string): Promise<boolean> {
        const sql = `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1`;
        const values = [DATABASE_NAME, table];

        const result = await this.execSql(sql, values);
        return result.length > 0;
    }

    private async createUserTableIfNotExists(): Promise<void> {
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

    async addUser(
        username: string,
        password: string,
        email: string,
    ): Promise<User> {
        await this.createUserTableIfNotExists();

        // Encrypt the password
        const hashedPassword = super.encryptPassword(password);

        // Generate id
        const id = uuidv4();

        const sql =
            'INSERT INTO user (userId, username, email, password) VALUES (?, ?, ?, ?)';
        const values = [id, username, email, hashedPassword];

        const result = await this.execSql(sql, values);

        return new User(id, username, hashedPassword, email);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        await this.createUserTableIfNotExists();
    
        const sql = 'SELECT * FROM user WHERE email = ? LIMIT 1';
        const values = [email];

        const result = await this.execSql(sql, values);

        if(result && result.length > 0) {
            const userInfo = result[0];
            return new User(userInfo.userId, userInfo.username, userInfo.password, userInfo.email);
        } else {
            return null;
        }
    }
}

export enum DatabaseType {
    MongoDB,
    MySQL
}

export class UserRepositoryFactory {
    static createUserRepository(databaseType: DatabaseType, dbConnection: MysqlConnection, dbOperation: DbOperation): UserRepository {
        switch(databaseType) {
            case DatabaseType.MongoDB:
                return new MongodbUserRepository(dbOperation);
            case DatabaseType.MySQL:
                return new MysqlUserRepository(dbConnection as MysqlConnection);
            default:
                throw new Error('Invalid database type');
        }
    }
}
