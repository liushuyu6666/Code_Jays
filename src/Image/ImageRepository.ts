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

    listImages(): Promise<Image[] | undefined>;
}

export class MongodbImageRepository implements ImageRepository {
    private dbOperation: DbOperation;

    constructor(dbOperation: DbOperation) {
        // TODO: put dbOperation into DatabaseRepository
        this.dbOperation = dbOperation;
    }

    private async existsCollection(colName: string): Promise<boolean> {
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

    private async createCollectionIfNotExists(colName: string): Promise<void> {
        const colExists = await this.existsCollection(colName);
        if(colExists) return;
        
        await this.dbOperation(async (client) => {
            (client as MongoClient).db().createCollection(colName);
        });
    }

    async createImage(
        imageId: string,
        fileName: string,
        key: string,
        uploadDate: Date,
    ): Promise<Image> {
        this.createCollectionIfNotExists('Image');
    
        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
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

    // TODO: pagination
    async listImages(): Promise<Image[] | undefined> {
        this.createCollectionIfNotExists('Image');

        const imagesWithId = await this.dbOperation(async (client) => {
            return (client as MongoClient)
                .db()
                .collection('Image')
                .find({})
                .toArray();
        });
        
        if(!imagesWithId) {
            return undefined;
        }

        return imagesWithId.map((image) => {
            return new Image(image.imageId, image.fileName, image.url, image.uploadDate);
        });
    }
}

export class MysqlImageRepository implements ImageRepository {
    private dbOperation: DbOperation;

    constructor(dbOperation: DbOperation) {
        // TODO: put dbOperation into DatabaseRepository
        this.dbOperation = dbOperation;
    }

    // TODO: move this to DatabaseRepository
    private async execSql(
        sql: string,
        values: (string | Date)[],
    ): Promise<any> {
        return await this.dbOperation(async (client) => {
            return new Promise((res, rej) => {
                (client as MysqlConnection).query(
                    sql,
                    values,
                    (error, result) => {
                        if (error) rej(error);
                        else res(result);
                    },
                );
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
        if (tableExists) return;
        const sql = `
            CREATE TABLE image (
                imageId VARCHAR(255) PRIMARY KEY,
                fileName VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                uploadDate TIMESTAMP NOT NULL
            )
        `;
        await this.execSql(sql, []);

        // TODO: logger
        console.log('Create image table in mysql');
    }

    async createImage(
        imageId: string,
        fileName: string,
        key: string,
        uploadDate: Date,
    ): Promise<Image> {
        await this.createImageTableIfNotExists();

        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        const sql =
            'INSERT INTO image (imageId, fileName, url, uploadDate) VALUES (?, ?, ?, ?)';
        const values = [imageId, fileName, url, uploadDate];

        await this.execSql(sql, values);

        return new Image(imageId, fileName, url, uploadDate);
    }

    // TODO: pagination
    async listImages(): Promise<Image[] | undefined> {
        await this.existsTable('image');

        const sql = 'SELECT * FROM image';

        const results = await this.execSql(sql, []);
        if (results) {
            const temp = results.map((result: any) => {
                return new Image(
                    result.imageId,
                    result.fileName,
                    result.url,
                    result.uploadDate,
                );
            });
            return temp;
        } else {
            return undefined;
        }
    }
}

export class ImageRepositoryFactory {
    static createImageRepository(
        databaseType: DatabaseType,
        dbOperation: DbOperation,
    ): ImageRepository {
        switch (databaseType) {
            case DatabaseType.MongoDB:
                return new MongodbImageRepository(dbOperation);
            case DatabaseType.MySQL:
                return new MysqlImageRepository(dbOperation);
            default:
                throw new Error('Invalid database type');
        }
    }
}
