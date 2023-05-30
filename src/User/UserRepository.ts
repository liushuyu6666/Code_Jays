import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { MongoClient } from 'mongodb';
import { DatabaseRepository, DatabaseType } from '../Database/DatabaseRepository';

// TODO: configurable
// const DATABASE_NAME = 'codejays';

export interface UserRepository {
    addUser(username: string, password: string, email: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
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
        const hashedPassword = super.encryptPassword(password);

        // Generate id
        const id = uuidv4();

        await this.dbOperation(async (client) => {
            const col = (client as MongoClient).db().collection('User');
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
            const col = (client as MongoClient).db().collection('User');
            return col.findOne({ email });
        });

        if(!user) return null;
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
