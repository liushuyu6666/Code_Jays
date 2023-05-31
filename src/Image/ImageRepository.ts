import { MongoClient } from 'mongodb';
import { Image } from './Image';
import {
    DatabaseRepository,
    DatabaseType,
} from '../Database/DatabaseRepository';

export interface ImageRepository {
    createImage(
        imageId: string,
        userId: string,
        fileName: string,
        url: string,
        uploadDate: Date,
    ): Promise<Image>;

    listImages(userId: string): Promise<Image[] | undefined>;
}

export class MongodbImageRepository
    extends DatabaseRepository
    implements ImageRepository
{
    constructor() {
        super(DatabaseType.MongoDB);
    }

    async createImage(
        imageId: string,
        userId: string,
        fileName: string,
        key: string,
        uploadDate: Date,
    ): Promise<Image> {
        await this.createCollectionIfNotExists('Image');

        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        await this.dbOperation(async (client) => {
            const col = (client as MongoClient).db().collection('Image');
            return col.insertOne({
                imageId,
                userId,
                fileName,
                url,
                uploadDate,
            });
        });

        return new Image(imageId, userId, fileName, url, uploadDate);
    }

    // TODO: pagination
    async listImages(userId: string): Promise<Image[] | undefined> {
        if(!await this.existsCollection('Image')) {
            return undefined;
        }

        const imagesWithId = await this.dbOperation(async (client) => {
            return (client as MongoClient)
                .db()
                .collection('Image')
                .find({ userId })
                .toArray();
        });

        if (!imagesWithId) {
            return undefined;
        }

        return imagesWithId.map((image) => {
            return new Image(
                image.imageId,
                userId,
                image.fileName,
                image.url,
                image.uploadDate,
            );
        });
    }
}

export class MysqlImageRepository
    extends DatabaseRepository
    implements ImageRepository
{
    constructor() {
        // TODO: put dbOperation into DatabaseRepository
        super(DatabaseType.MySQL);
    }

    async createImage(
        imageId: string,
        userId: string,
        fileName: string,
        key: string,
        uploadDate: Date,
    ): Promise<Image> {
        await this.createImageTableIfNotExists();

        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        const sql =
            'INSERT INTO image (imageId, userId, fileName, url, uploadDate) VALUES (?, ?, ?, ?, ?)';
        const values = [imageId, userId, fileName, url, uploadDate];

        await this.execSql(sql, values);

        return new Image(imageId, userId, fileName, url, uploadDate);
    }

    // TODO: pagination
    async listImages(userId: string): Promise<Image[] | undefined> {
        if(!await this.existsTable('image')) {
            return undefined;
        }

        const sql = 'SELECT * FROM image where userId = ?';

        const results = await this.execSql(sql, [userId]);
        if (results) {
            const temp = results.map((result: any) => {
                return new Image(
                    result.imageId,
                    userId,
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
    static createImageRepository(databaseType: DatabaseType): ImageRepository {
        switch (databaseType) {
            case DatabaseType.MongoDB:
                return new MongodbImageRepository();
            case DatabaseType.MySQL:
                return new MysqlImageRepository();
            default:
                throw new Error('Invalid database type');
        }
    }
}
