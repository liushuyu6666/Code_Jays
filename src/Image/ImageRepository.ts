import { MongoClient } from 'mongodb';
import { DbOperation } from '../../db';
import { Image } from './Image';
import { Connection as MysqlConnection } from 'mysql';
import { DatabaseType } from '../User/UserRepository';

const DATABASE_NAME = 'codejays';

export interface ImageRepository {
    createImage(
        imageId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ): Promise<Image>;
}

export class MongodbImageRepository implements ImageRepository {
    private dbOperation: DbOperation;

    constructor(dbOperation: DbOperation) {
        // TODO: put dbOperation into DatabaseRepository
        this.dbOperation = dbOperation;
    }

    async createImage(
        imageId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ): Promise<Image> {
        await this.dbOperation(async (client) => {
            const col = (client as MongoClient).db().collection('Image');
            return col.insertOne({
                imageId,
                fileName,
                url,
                uploadDate,
            });
        });

        return new Image(imageId, fileName, url, uploadDate);
    }
}

export class MysqlImageRepository implements ImageRepository {
    private dbOperation: DbOperation;

    constructor(dbOperation: DbOperation) {
        // TODO: put dbOperation into DatabaseRepository
        this.dbOperation = dbOperation;
    }

    // TODO: move this to DatabaseRepository
    private async execSql(sql: string, values: (string | Date)[]): Promise<any> {
        return await this.dbOperation(async (client) => {
            return new Promise((res, rej) => {
                (client as MysqlConnection).query(sql, values, (error, result) => {
                    if (error) rej(error);
                    else res(result);
                });
            });
        });
    }

    // TODO: move this to DatabaseRepository
    private async existsTable(table: string): Promise<boolean> {
        const sql = `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1`;
        const values = [DATABASE_NAME, table];

        const result = await this.execSql(sql, values);
        return result.length > 0;
    }

    // TODO: move this to DatabaseRepository
    private async createImageTableIfNotExists(): Promise<void> {
        const tableExists = await this.existsTable('image');
        if(tableExists) return;
        const sql = `
            CREATE TABLE user (
                imageId VARCHAR(255) PRIMARY KEY,
                fileName VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                uploadDate TIMESTAMP NOT NULL
            )
        `;
        await this.execSql(sql, []);
        
        // TODO: logger
        console.log("Create user table in mysql");
    }

    async createImage(
        imageId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ): Promise<Image> {
        const sql = "INSERT INTO images (imageId, fileName, url, uploadDate) VALUES (%s, %s, %s, %s)";
        const values = [imageId, fileName, url, uploadDate];

        await this.execSql(sql, values);

        return new Image(imageId, fileName, url, uploadDate);
    }
}

export class ImageRepositoryFactory {
    static createImageRepository(databaseType: DatabaseType, dbOperation: DbOperation): ImageRepository {
        switch(databaseType) {
            case DatabaseType.MongoDB:
                return new MongodbImageRepository(dbOperation);
            case DatabaseType.MySQL:
                return new MysqlImageRepository(dbOperation);
            default:
                throw new Error('Invalid database type');
        }
    }
}


