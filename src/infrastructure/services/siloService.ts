import { injectable } from "tsyringe";
import { IAwsS3Service } from "../../domain/interfaces/services/awsS3Service.interface";

import {
    S3Client,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "fs";
import { env } from "../config/env";
import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";

@injectable()
export class SiloS3Service implements IAwsS3Service {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: env.SILO_REGION,
            endpoint: env.SILO_ENDPOINT,
            forcePathStyle: true,
            credentials: {
                accessKeyId: env.SILO_ACCESS_KEY,
                secretAccessKey: env.SILO_SECRET_KEY,
            },
        });
    }

    async uploadFileToAws(key: string, filePath: string): Promise<string> {
        try {
            const fileStream = createReadStream(filePath);

            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: env.SILO_BUCKET_NAME,
                    Key: key,
                    Body: fileStream,
                })
            );

            return key;
        } catch (error) {
            console.error("Silo upload error:", error);
            throw new AppError(
                "Failed to upload file to local storage",
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getFileUrlFromAws(
        fileName: string,
        expireTime: number
    ): Promise<string> {
        try {
            const available = await this.isFileAvailableInAwsBucket(fileName);

            if (!available) return "";

            const command = new GetObjectCommand({
                Bucket: env.SILO_BUCKET_NAME,
                Key: fileName,
            });

            return await getSignedUrl(this.s3Client, command, {
                expiresIn: expireTime ?? 3600,
            });
        } catch (error) {
            console.error("Silo signed URL error:", error);
            throw new AppError(
                "Failed to generate local storage URL",
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async isFileAvailableInAwsBucket(fileName: string): Promise<boolean> {
        try {
            await this.s3Client.send(
                new HeadObjectCommand({
                    Bucket: env.SILO_BUCKET_NAME,
                    Key: fileName,
                })
            );

            return true;
        } catch (error: any) {
            if (
                error.name === "NotFound" ||
                error.name === "NoSuchKey" ||
                error.$metadata?.httpStatusCode === 404
            ) {
                return false;
            }

            throw error;
        }
    }

    async deleteFileFromAws(fileName: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: env.SILO_BUCKET_NAME,
                    Key: fileName,
                })
            );
        } catch (error) {
            console.error("Silo delete error:", error);
            throw new AppError(
                "Failed to delete file from local storage",
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    getPublicFileUrl(fileKey: string): string {
        return `${env.SILO_ENDPOINT}/${env.SILO_BUCKET_NAME}/${fileKey}`;
    }
}