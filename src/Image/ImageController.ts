import { DbOperation } from "../../db";
import { DatabaseType } from "../User/UserRepository";
import { ImageService } from "./ImageService";
import { Request, Response } from "express";


export class ImageController {
    private imageService: ImageService;

    constructor(databaseType: DatabaseType, dbOperation: DbOperation, s3Client: AWS.S3, bucketName: string) {
        this.imageService = new ImageService(databaseType, dbOperation, s3Client, bucketName);
    }

    async uploadImageToS3(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
        const { imageName, imageContent } = req.body;

        if(!imageContent || !imageName) {
            return res
                .status(400)
                .json({ error: "Image or image name are required" });
        }

        await this.imageService.uploadImage(imageName, imageContent);

        return res.status(201).json({ message: `Image ${imageName} uploaded successfully`});
    }
}