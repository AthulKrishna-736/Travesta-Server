import { IUser } from "./user.interface";

export interface IAdmin extends Pick<IUser, 'email' | 'password' | 'profileImage' | 'firstName' | 'lastName'> { };

export interface IPlatformFeeService {
    settlePlatformFee(): Promise<void>;
    scheduleCron(): void;
}

export interface ISocketService {
    totalClients: number;
}

export interface IAwsImageUploader {
    uploadRoomImages(vendorId: string, images: Express.Multer.File[]): Promise<string[]>;
    uploadHotelImages(vendorId: string, images: Express.Multer.File[]): Promise<string[]>;
    deleteImagesFromAws(images: string[] | undefined, dbImageObject: string[]): Promise<boolean>;
    uploadProfileImage(id: string, file: Express.Multer.File): Promise<string>;
    deleteProfileImage(imageUrl: string): Promise<boolean>;
    uploadHotelRatingImages(userId: string, files: Express.Multer.File[]): Promise<string[]>;
}
