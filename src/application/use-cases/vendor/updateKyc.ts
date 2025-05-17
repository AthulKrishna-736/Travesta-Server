import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import path from 'path';
import fs from 'fs';
import { IUpdateKycUseCase } from "../../../domain/interfaces/usecases.interface";
import { IUserRepository } from "../../../domain/repositories/repository.interface";

@injectable()
export class UpdateKycUseCase implements IUpdateKycUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
        @inject(TOKENS.AwsS3Service) private readonly _s3Service: IAwsS3Service
    ) { }

    async execute(userId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: ResponseUserDTO, message: string }> {
        const user = await this._userRepo.findUserById(userId);
        if (!user) throw new AppError("User not found", HttpStatusCode.NOT_FOUND);

        const uploadAndClean = async (file: Express.Multer.File, name: string) => {
            const ext = path.extname(file.path);
            const key = `users/kyc_${name}_${userId}${ext}`;
            await this._s3Service.uploadFileToAws(key, file.path);
            fs.unlink(file.path, (err) => {
                if (err) console.error("Failed to clean local file", err);
            });
            return key;
        };

        const [frontKey, backKey] = await Promise.all([
            uploadAndClean(frontFile, "front"),
            uploadAndClean(backFile, "back"),
        ]);

        const existingDocs = user.kycDocuments || [];
        const updatedDocs = [...existingDocs, frontKey, backKey];
        const updated = await this._userRepo.updateUser(userId, { kycDocuments: updatedDocs });

        if (!updated) {
            throw new AppError('Error while updating user', HttpStatusCode.BAD_REQUEST);
        }

        const signedUrls = await Promise.all(
            updated.kycDocuments!.map((key) => this._s3Service.getFileUrlFromAws(key, 86400))
        );


        const mappedUser: ResponseUserDTO = {
            id: user._id!,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isGoogle: user.isGoogle!,
            isBlocked: user.isBlocked,
            wishlist: user.wishlist,
            subscriptionType: user.subscriptionType,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            kycDocuments: signedUrls,
        };

        return {
            vendor: mappedUser,
            message: 'KYC documents updated successfully',
        };
    }
}
