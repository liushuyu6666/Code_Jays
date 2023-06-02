import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { MongoClient } from 'mongodb';
import { DatabaseRepository, DatabaseType } from '../Database/DatabaseRepository';

// TODO: configurable
// const DATABASE_NAME = 'codejays';

export interface UserRepository {
    addUser(username: string, password: string, email: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | undefined>;
}

export class MongodbUserRepository extends DatabaseRepository implements UserRepository {
    constructor()  {
        super(DatabaseType.MongoDB);
    }
    
    async addUser(
        username: string,
        password: string,
        email: string,
    ): Promise<User> {
        await this.createCollectionIfNotExists('User');
    
        const hashedPassword = super.encryptPassword(password);

        // Generate id
        const id = uuidv4();

        await this.dbOperation(async (client) => {
            const col = (client as MongoClient).db().collection('User');
            return await col.insertOne({
                username,
                password: hashedPassword,
                email,
                userId: id
            });
        })

        return new User(id, username, hashedPassword, email);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        if(!await this.existsCollection('User')) {
            return undefined;
        }

        const user = await this.dbOperation(async (client) => {
            const col = (client as MongoClient).db().collection('User');
            return await col.findOne({ email });
        });

        if(!user) return undefined;
        return new User(user.userId, user.username, user.password, user.email);
    }
}

export class MysqlUserRepository extends DatabaseRepository implements UserRepository {
    constructor()  {
        super(DatabaseType.MySQL);
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

    async getUserByEmail(email: string): Promise<User | undefined> {
        if(!await this.existsTable('user')) {
            return undefined;
        }
    
        const sql = 'SELECT * FROM user WHERE email = ? LIMIT 1';
        const values = [email];

        const result = await this.execSql(sql, values);

        if(result && result.length > 0) {
            const userInfo = result[0];
            return new User(userInfo.userId, userInfo.username, userInfo.password, userInfo.email);
        } else {
            return undefined;
        }
    }
}

export class UserRepositoryFactory {
    static createUserRepository(databaseType: DatabaseType): UserRepository {
        switch(databaseType) {
            case DatabaseType.MongoDB:
                return new MongodbUserRepository();
            case DatabaseType.MySQL:
                return new MysqlUserRepository();
            default:
                throw new Error('Invalid database type');
        }
    }
}
