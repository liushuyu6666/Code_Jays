import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class S3Repository {
    private s3Client: S3Client;
    // TODO: try to configure bucketName in s3Client
    private bucketName: string;

    constructor(s3Client: S3Client, bucketName: string) {
        this.s3Client = s3Client;
        this.bucketName = bucketName
    }

    private async existsBucket(bucketName: string): Promise<boolean> {
        const headBucketCommand = new HeadBucketCommand({ Bucket: bucketName });
        try {
            await this.s3Client.send(headBucketCommand);
            return true;
        } catch {
            return false
        }
    }

    async uploadFile(fileId: string, fileContent: Express.Multer.File, prefix?: string): Promise<string | undefined> {
        if(!(await this.existsBucket(this.bucketName))) {
            return undefined;
        }

        const key = prefix ? `${prefix}/${fileId}` : `files/${fileId}`

        const uploadParams = {
            Bucket: this.bucketName,
            Key: key,
            File: fileContent
        }

        // upload file
        const command = new PutObjectCommand(uploadParams);
        await this.s3Client.send(command);

        return key;
    }
}