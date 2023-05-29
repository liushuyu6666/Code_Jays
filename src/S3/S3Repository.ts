import AWS from 'aws-sdk';

export class S3Repository {
    private s3Client: AWS.S3
    // TODO: try to configure bucketName in s3Client
    private bucketName: string;

    constructor(s3Client: AWS.S3, bucketName: string) {
        this.s3Client = s3Client;
        this.bucketName = bucketName
    }

    async uploadFile(fileId: string, fileContent: Buffer, prefix?: string): Promise<string> {
        const key = prefix ? `${prefix}/${fileId}` : `files/${fileId}`

        // upload file
        const file = await this.s3Client.upload({
            Bucket: this.bucketName,
            Key: key,
            Body: fileContent
        }).promise();

        return key;
    }
}