import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import path from 'path';
import fs from 'fs';
import { IUpdateKycUseCase } from "../../../domain/interfaces/model/usecases.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { awsS3Timer } from "../../../infrastructure/config/jwtConfig";
import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
import { IVendor } from "../../../domain/interfaces/model/vendor.interface";
import { TResponseUserData } from "../../../domain/interfaces/model/user.interface";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class UpdateKycUseCase implements IUpdateKycUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.AwsS3Service) private _s3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private _redisService: IRedisService,
    ) { }

    async updateKyc(userId: string, frontFile: Express.Multer.File, backFile: Express.Multer.File): Promise<{ vendor: TResponseUserData, message: string }> {
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
        let signedUrls
        if (updated.kycDocuments) {
            signedUrls = await Promise.all(
                updated.kycDocuments.map((key) => this._s3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
            await this._redisService.storeKycDocs(user._id as string, signedUrls, awsS3Timer.expiresAt)
        }


        const mappedUser: TResponseUserData = {
            ...user,
            kycDocuments: signedUrls,
        };

        const mapUser = ResponseMapper.mapUserToResponseDTO(mappedUser);


        return {
            vendor: mapUser,
            message: 'KYC documents updated successfully',
        };
    }
}
