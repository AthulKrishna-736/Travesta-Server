import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import path from 'path';
import fs from 'fs';
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";

export class AwsImageUploader {
    constructor(protected _awsS3Service: IAwsS3Service) { }

    async uploadRoomImages(vendorId: string, images: Express.Multer.File[]): Promise<string[]> {
        return await Promise.all(images.map(async (i, index) => {
            const s3Key = `room/${vendorId}_${Date.now()}_${index}${path.extname(i.originalname)}`;

            try {
                await this._awsS3Service.uploadFileToAws(s3Key, i.path)
                return s3Key;
            } catch (error) {
                throw new AppError("Error uploading room images", HttpStatusCode.INTERNAL_SERVER_ERROR);
            } finally {
                fs.unlink(i.path, (err) => {
                    if (err) {
                        console.error('Erorr deleting the image: ', i.path)
                    }
                });
            }
        }))
    }

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

    async deleteImagesFromAws(images: string[] | undefined, dbImageObject: string[]): Promise<boolean> {
        if (!images) {
            throw new AppError('No images provided', HttpStatusCode.BAD_REQUEST);
        }
        const oldImages = images.map((i) => {
            const url = new URL(i)
            return decodeURIComponent(url.pathname).slice(1);
        })

        const deletedImages = dbImageObject.filter(i => !oldImages.includes(i))

        await Promise.all(
            deletedImages.map(async (i) => {
                try {
                    await this._awsS3Service.deleteFileFromAws(i);
                } catch (error) {
                    throw new AppError('AWS error while deleting images', HttpStatusCode.INTERNAL_SERVER_ERROR);
                }
            })
        );
        return true
    }

    async uploadProfileImage(id: string, file: Express.Multer.File): Promise<string> {
        try {
            const s3Key = `users/profile_${id}${path.extname(file.path)}`;
            await this._awsS3Service.uploadFileToAws(s3Key, file.path);
            return s3Key;
        } catch (error) {
            throw new AppError('error while uploading profile image', HttpStatusCode.INTERNAL_SERVER_ERROR);
        } finally {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(`error while deleting file: ${err}`)
                }
            });
        }
    }

    async deleteProfileImage(imageUrl: string): Promise<boolean> {
        try {
            const url = new URL(imageUrl);
            const deleteImage = decodeURIComponent(url.pathname).slice(1);
            await this._awsS3Service.deleteFileFromAws(deleteImage);
            return true
        } catch (error) {
            throw new AppError('Error while deleting image from aws', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
