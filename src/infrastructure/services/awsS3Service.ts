import { injectable } from "tsyringe";
import { IAwsS3Service } from "../../domain/services/awsS3Service.interface";
import { S3Client, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from "../config/env";
import { createReadStream } from "fs";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";


@injectable()
export class AwsS3Service implements IAwsS3Service {
    private s3Client: S3Client;
    constructor() {
        this.s3Client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESSKEYID,
                secretAccessKey: env.AWS_SECRETACCESSKEY,
            },
        });
    }

    async uploadFileToAws(key: string, filePath: string): Promise<string> {
        const fileName = createReadStream(filePath);
        const uploadParams = {
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            Body: fileName,
        }

        try {
            await this.s3Client.send(new PutObjectCommand(uploadParams));
            return key;
        } catch (error) {
            console.error("S3 upload error:", error);
            throw new AppError("Failed to upload file to S3", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getFileUrlFromAws(fileName: string, expireTime: number): Promise<string> {
        const check = await this.isFileAvailableInAwsBucket(fileName);

        if (check) {
            const command = new GetObjectCommand({
                Bucket: env.AWS_BUCKET_NAME,
                Key: fileName,
            });

            if (expireTime !== null) {
                const url = await getSignedUrl(this.s3Client, command, {
                    expiresIn: expireTime,
                });
                return url;
            } else {
                const url = await getSignedUrl(this.s3Client, command);
                return url;
            }
        } else {
            return "";
        }
    }

    async isFileAvailableInAwsBucket(fileName: string): Promise<boolean> {
        try {
            await this.s3Client.send(new HeadObjectCommand({
                Bucket: env.AWS_BUCKET_NAME,
                Key: fileName,
            })
            );

            return true;
        } catch (error) {
            if (error instanceof Error && error.name === "NotFound") {
                return false;
            } else {
                return false;
            }
        }
    }

    async deleteFileFromAws(fileName: string): Promise<void> {
        const uploadParams = {
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileName,
        };

        await this.s3Client.send(new DeleteObjectCommand(uploadParams))
    }

    getPublicFileUrl(fileKey: string): string {
        return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }
}