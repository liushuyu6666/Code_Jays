import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load the environment variables from the .env file
dotenv.config({ path: '.env.local' });

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
