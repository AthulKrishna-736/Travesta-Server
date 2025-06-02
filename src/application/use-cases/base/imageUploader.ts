import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import path from 'path';
import fs from 'fs';
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";

export class HotelImageUploader {
    constructor(private _awsS3Service: IAwsS3Service) { }

    async uploadHotelImages(vendorId: string, images: Express.Multer.File[]): Promise<string[]> {
        return await Promise.all(images.map(async (i, index) => {
            const s3Key = `hotels/${vendorId}_${Date.now()}_${index}${path.extname(i.originalname)}`;

            try {
                await this._awsS3Service.uploadFileToAws(s3Key, i.path)
                return s3Key;
            } catch (error) {
                console.error(`Failed to upload file ${i.originalname}:`, error);
                throw new AppError("Error uploading hotel images", HttpStatusCode.INTERNAL_SERVER_ERROR);
            } finally {
                fs.unlink(i.path, (err) => {
                    if (err) {
                        console.error('Erorr deleting the image: ', i.path)
                    }
                });
            }
        }));
    }
}
